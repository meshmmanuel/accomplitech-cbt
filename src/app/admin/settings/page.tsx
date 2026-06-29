import { Button } from "@/components/ui/button";

const settingsSections = [
  {
    title: "Exam Behaviour",
    items: [
      {
        label: "Auto-submit on timeout",
        desc: "Automatically submit when timer reaches zero",
        enabled: true,
      },
      {
        label: "Allow question flagging",
        desc: "Students can flag questions for review",
        enabled: true,
      },
      {
        label: "Shuffle question order",
        desc: "Randomise question sequence per student",
        enabled: false,
      },
      {
        label: "Shuffle answer options",
        desc: "Randomise MCQ options per student",
        enabled: false,
      },
      {
        label: "Show question count to students",
        desc: "Students can see total question number",
        enabled: true,
      },
      {
        label: "Log tab focus events",
        desc: "Record when students switch or minimise the window",
        enabled: true,
      },
    ],
  },
  {
    title: "Network",
    items: [
      {
        label: "Restrict to LAN only",
        desc: "Block access from outside the local network",
        enabled: true,
      },
      {
        label: "Show server status on landing page",
        desc: "Display connection info to students",
        enabled: true,
      },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="max-w-[540px]">
      {settingsSections.map((section) => (
        <div
          key={section.title}
          className="mb-4 overflow-hidden rounded-xl border border-exam-border bg-exam-white"
        >
          <div className="border-b border-exam-border px-4.5 py-3 text-[13px] font-bold text-exam-text">
            {section.title}
          </div>
          {section.items.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-4.5 py-3 ${
                i < section.items.length - 1 ? "border-b border-exam-border" : ""
              }`}
            >
              <div>
                <div className="text-[13px] font-medium text-exam-text">
                  {item.label}
                </div>
                <div className="mt-0.5 text-[11px] text-exam-muted">
                  {item.desc}
                </div>
              </div>
              <div
                className={`relative h-[22px] w-10 shrink-0 rounded-full ${
                  item.enabled ? "bg-navy" : "bg-exam-border"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-exam-white transition-all ${
                    item.enabled ? "left-[21px]" : "left-0.5"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="mb-4 overflow-hidden rounded-xl border border-exam-border bg-exam-white">
        <div className="border-b border-exam-border px-4.5 py-3 text-[13px] font-bold text-exam-text">
          Network Configuration
        </div>
        {[
          { label: "Server IP Address", value: "192.168.1.1" },
          { label: "Port", value: "8080" },
          { label: "Max Connections", value: "60" },
        ].map((field, i) => (
          <div
            key={field.label}
            className={`flex items-center justify-between px-4.5 py-3 ${
              i < 2 ? "border-b border-exam-border" : ""
            }`}
          >
            <span className="text-[13px] text-exam-text">{field.label}</span>
            <input
              defaultValue={field.value}
              className="w-32 rounded-md border border-exam-border px-2.5 py-1.5 text-right text-[13px] text-exam-text"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2.5">
        <Button variant="primary">Save Settings</Button>
        <Button variant="ghost">Reset to Defaults</Button>
      </div>
    </div>
  );
}
