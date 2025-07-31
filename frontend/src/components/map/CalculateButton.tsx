import { useRouteHandlers } from "./useRouteHandlers";

export function CalculateButton() {
    const { handleClick } = useRouteHandlers();

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                className="fixed top-4 left-1/2 -translate-x-1/2 p-3 rounded-lg shadow-md z-10 hover:shadow-lg transition bg-komyut-orange text-komyut-white font-epilogue font-bold"
            >
                <p
                    className="font-epilogue font-bold inline-block"
                >
                    Find Route
                </p>
            </button>
        </div>
    );
}