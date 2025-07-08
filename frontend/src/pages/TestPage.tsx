import { useLoading } from "@/components/loading/useLoading";

export default function TestPage() {
  const { loading, startLoading, stopLoading } = useLoading();

  const handleLoad = () => {
    startLoading();
    setTimeout(() => {
      stopLoading();
    }, 2000); // fake delay
  };

  return (
    <>
      {loading}
      <h1> Test environment </h1>
      <div className="p-8">
        <button onClick={handleLoad} className="bg-orange-300 px-4 py-2 rounded">
          Trigger throbber with fake API call
        </button>
      </div>
    </>
  );
}

