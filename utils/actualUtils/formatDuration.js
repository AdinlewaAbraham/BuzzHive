export function formatDuration(duration, noMultipleZeros) {
  let seconds = Math.floor(duration % 60);
  let minutes = Math.floor((duration / 60) % 60);
  let hours = Math.floor(duration / 3600);

  seconds = seconds < 10 ? `0${seconds}` : seconds;
  minutes =
    minutes < 10 ? (noMultipleZeros ? minutes : `0${minutes}`) : minutes;
  hours = hours < 10 ? `0${hours}` : hours;

  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${minutes}:${seconds}`;
}
