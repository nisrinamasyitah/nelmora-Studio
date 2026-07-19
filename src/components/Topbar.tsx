interface TopbarProps {
  section: string;
}

export default function Topbar({ section }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="crumb">
        NelMora / <b>{section}</b>
      </div>
    </div>
  );
}
