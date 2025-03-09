export const formatDate = (
  dateInput?: string | Date,
  isFullDate = false,
  isWithTime = false
): string => {
  const listMonth = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let date: Date;

  if (typeof dateInput === "string") {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return "-";
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = listMonth[month];

  if (isWithTime) {
    return `${date.getDate()} ${monthName}, ${year} ${date.getHours()}:${date.getMinutes()}`;
  }
  if (isFullDate) {
    return `${date.getDate()} ${monthName}, ${year}`;
  } else {
    return `${monthName} ${year}`;
  }
};

export default formatDate;
