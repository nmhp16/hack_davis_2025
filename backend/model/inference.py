import torch
import numpy as np
from transformers import BertTokenizer, BertForSequenceClassification
import argparse

class SuicideDetectionInference:
    def __init__(self, model_path='backend/model/saved_model', label_encoder_path='backend/model/label_encoder.npy'):
        # Set device and handle multiple GPUs
        if torch.cuda.is_available():
            self.device = torch.device('cuda')
            self.num_gpus = torch.cuda.device_count()
            print(f'Using {self.num_gpus} GPU(s)')
            for i in range(self.num_gpus):
                print(f'GPU {i}: {torch.cuda.get_device_name(i)}')
                print(f'GPU {i} Memory: {torch.cuda.get_device_properties(i).total_memory / 1024**3:.2f} GB')
        else:
            self.device = torch.device('cpu')
            self.num_gpus = 0
            print('CUDA is not available. Using CPU instead.')
        
        # Load tokenizer and model
        self.tokenizer = BertTokenizer.from_pretrained(model_path)
        self.model = BertForSequenceClassification.from_pretrained(model_path)
        
        # Move model to device and wrap with DataParallel if multiple GPUs
        if self.num_gpus > 1:
            print(f'Using {self.num_gpus} GPUs with DataParallel')
            self.model = torch.nn.DataParallel(self.model)
        self.model.to(self.device)
        self.model.eval()
        
        # Load label encoder classes
        self.label_classes = np.load(label_encoder_path, allow_pickle=True)
        
    def predict(self, text, return_probabilities=False):
        """
        Make a prediction for a given text.
        
        Args:
            text (str): The input text to classify
            return_probabilities (bool): If True, return probability scores for all classes
            
        Returns:
            If return_probabilities is False:
                tuple: (predicted_label, confidence_score)
            If return_probabilities is True:
                tuple: (predicted_label, confidence_score, probability_dict)
        """
        # Tokenize the text
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=512,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        # Move to device
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        
        # Make prediction
        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            probabilities = torch.softmax(outputs.logits, dim=1)
            
        # Get predicted class and confidence
        predicted_class_idx = torch.argmax(probabilities, dim=1).item()
        confidence_score = probabilities[0][predicted_class_idx].item()
        predicted_label = self.label_classes[predicted_class_idx]
        
        if return_probabilities:
            # Create dictionary of class probabilities
            prob_dict = {
                label: prob.item() 
                for label, prob in zip(self.label_classes, probabilities[0])
            }
            return predicted_label, confidence_score, prob_dict
        
        return predicted_label, confidence_score

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Make predictions using the trained suicide detection model')
    parser.add_argument('--text', type=str, required=True,
                      help='Text to analyze for suicide detection')
    parser.add_argument('--show-probabilities', action='store_true',
                      help='Show probabilities for all classes')
    args = parser.parse_args()

    # Initialize inference
    inference = SuicideDetectionInference()
    
    # Make prediction
    if args.show_probabilities:
        label, confidence, probs = inference.predict(args.text, return_probabilities=True)
        print(f"\nText: {args.text}")
        print(f"Predicted label: {label}")
        print(f"Confidence: {confidence:.2%}")
        print("\nClass probabilities:")
        for class_label, prob in probs.items():
            print(f"{class_label}: {prob:.2%}")
    else:
        label, confidence = inference.predict(args.text)
        print(f"\nText: {args.text}")
        print(f"Predicted label: {label}")
        print(f"Confidence: {confidence:.2%}")

if __name__ == "__main__":
    main()
