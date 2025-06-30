import PromptInput from '../components/PromptInput';

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <PromptInput />
      </div>
    </main>
  );
}
