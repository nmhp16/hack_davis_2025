import torch
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertForSequenceClassification
from torch.optim import AdamW
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tqdm import tqdm
import os
import argparse

class TextClassificationDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]

        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

def train_model(model, train_loader, val_loader, device, num_epochs=3):
    optimizer = AdamW(model.parameters(), lr=2e-5)
    
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        
        for batch in tqdm(train_loader, desc=f'Epoch {epoch + 1}/{num_epochs}'):
            # Move batch to device
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)

            # Clear gradients
            optimizer.zero_grad()

            # Forward pass
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )

            loss = outputs.loss
            total_loss += loss.item()

            # Backward pass
            loss.backward()
            optimizer.step()

            # Clear memory
            del outputs
            torch.cuda.empty_cache()

        avg_train_loss = total_loss / len(train_loader)
        print(f'Average training loss: {avg_train_loss}')

        # Validation
        model.eval()
        val_loss = 0
        correct = 0
        total = 0

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)

                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )

                val_loss += outputs.loss.item()
                predictions = torch.argmax(outputs.logits, dim=1)
                correct += (predictions == labels).sum().item()
                total += labels.size(0)

                # Clear memory
                del outputs
                torch.cuda.empty_cache()

        avg_val_loss = val_loss / len(val_loader)
        accuracy = correct / total
        print(f'Validation Loss: {avg_val_loss}')
        print(f'Validation Accuracy: {accuracy}')

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Train a BERT model for text classification')
    parser.add_argument('--num_samples', type=int, default=None,
                      help='Number of samples to use for training (default: use all data)')
    args = parser.parse_args()

    # Check CUDA availability and set device
    if torch.cuda.is_available():
        device = torch.device('cuda')
        print(f'Using GPU: {torch.cuda.get_device_name(0)}')
        print(f'GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB')
        # Set CUDA device
        torch.cuda.set_device(0)
    else:
        device = torch.device('cpu')
        print('CUDA is not available. Using CPU instead.')

    # Load and preprocess data
    print('Loading data...')
    df = pd.read_csv('datasets/Suicide_Detection.csv')
    
    # Limit the number of samples if specified
    if args.num_samples is not None:
        df = df.head(args.num_samples)
        print(f'Using {args.num_samples} samples for training')
    
    # Assuming the columns are in order: id, text, class
    texts = df.iloc[:, 1].values  # Second column is text
    labels = df.iloc[:, 2].values  # Third column is class

    # Convert labels to integers using LabelEncoder
    label_encoder = LabelEncoder()
    labels = label_encoder.fit_transform(labels)

    # Split the data
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=0.2, random_state=42
    )

    print(f'Training set size: {len(train_texts)}')
    print(f'Validation set size: {len(val_texts)}')

    print('Initializing model...')
    # Initialize tokenizer and model
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    model = BertForSequenceClassification.from_pretrained(
        'bert-base-uncased',
        num_labels=len(np.unique(labels))
    )

    # Move model to device
    model = model.to(device)
    print(f'Model device: {next(model.parameters()).device}')

    # Create datasets
    train_dataset = TextClassificationDataset(train_texts, train_labels, tokenizer)
    val_dataset = TextClassificationDataset(val_texts, val_labels, tokenizer)

    # Create dataloaders with pin_memory for faster data transfer to GPU
    train_loader = DataLoader(
        train_dataset, 
        batch_size=16, 
        shuffle=True,
        pin_memory=True,
        num_workers=4
    )
    val_loader = DataLoader(
        val_dataset, 
        batch_size=16,
        pin_memory=True,
        num_workers=4
    )

    print('Starting training...')
    # Train the model
    train_model(model, train_loader, val_loader, device)

    print('Saving model...')
    # Save the model and label encoder
    model.save_pretrained('backend/model/saved_model')
    tokenizer.save_pretrained('backend/model/saved_model')
    np.save('backend/model/label_encoder.npy', label_encoder.classes_)
    print('Training completed!')

if __name__ == '__main__':
    main()
