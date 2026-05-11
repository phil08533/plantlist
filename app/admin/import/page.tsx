import { ImportClient } from "./ImportClient";

export default function ImportPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Excel import</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Download the template, fill in plants, and upload. Rows are validated before
          anything is written to the database.
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
