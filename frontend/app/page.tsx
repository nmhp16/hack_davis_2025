import Upload from "../components/Upload"

export default function Home() {
  return (
    <div className="grid justify-items-center min-h-screen sm:p-20">
      <main className="flex flex-col gap-[12px] items-center">
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-blue-800 to-blue-400 text-transparent bg-clip-text">
          SuAIcide
        </h1>
        <p className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-blue-800 text-transparent bg-clip-text">
          AI-powered suicide risk detection in suicide hotline
        </p>
      </main>
      <Upload />
    </div>
  );
}
