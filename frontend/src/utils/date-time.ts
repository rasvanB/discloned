const relativeDateFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en", {
  timeStyle: "short",
});

function capitalize(string: string) {
  if (!/^[a-zA-Z]/.test(string)) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatMessageDate(date: Date) {
  const today = new Date().setHours(24, 59, 59, 999);
  const daysPassed = Math.floor(
    (today - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysPassed > 1) return dateFormatter.format(date);
  return relativeDateFormatter.format(-1 * daysPassed, "day");
}

function formatMessageTime(date: Date) {
  return timeFormatter.format(date);
}

export function formatMessageDateTime(date: Date) {
  return `${capitalize(formatMessageDate(date))} at ${formatMessageTime(date)}`;
}
