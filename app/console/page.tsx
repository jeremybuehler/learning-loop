export default function ConsoleHome() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">LearningLoop Console</h1>
      <p className="text-sm text-gray-600">Local development console. Use the links below.</p>
      <ul className="list-disc ml-6 text-sm">
        <li><a className="text-blue-600 underline" href="/console/telemetry">Telemetry</a></li>
        <li><a className="text-blue-600 underline" href="/console/feedback">Feedback</a></li>
        <li><a className="text-blue-600 underline" href="/console/scores">Scores</a></li>
        <li><a className="text-blue-600 underline" href="/console/config">Eval Config</a></li>
      </ul>
    </main>
  )
}
