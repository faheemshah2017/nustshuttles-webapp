const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;   // 2 minutes
const IDLE_THRESHOLD_MS = 15 * 60 * 1000;    // 15 minutes
const CLOCK_MISMATCH_MS = 24 * 60 * 60 * 1000; // flag device clock if off by more than a day
const REFRESH_INTERVAL_MS = 30 * 1000;       // 30 seconds

function timeSince(date) {
  const seconds = Math.floor(Math.max(Date.now() - date.getTime(), 0) / 1000);
  if (seconds < 60) return seconds + "s ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
}

function statusBadge(date) {
  if (!date) {
    return '<span class="badge badge-secondary">Never</span>';
  }
  const age = Date.now() - date.getTime();
  if (age <= ONLINE_THRESHOLD_MS) {
    return '<span class="badge badge-success">Online</span>';
  }
  if (age <= IDLE_THRESHOLD_MS) {
    return '<span class="badge badge-warning">Idle</span>';
  }
  return '<span class="badge badge-danger">Offline</span>';
}

function loadStatus() {
  $.ajax({
    url: "/shuttles/statusData",
    cache: false,
    type: "GET",
    success: function (statuses) {
      renderStatus(statuses);
      document.getElementById("lastRefreshed").innerHTML =
        "Refreshed " + new Date().toLocaleTimeString();
    },
  });
}

function renderStatus(statuses) {
  statuses.sort((a, b) =>
    ("" + a.shuttleNumber).localeCompare("" + b.shuttleNumber)
  );

  let rows = "";
  statuses.forEach((s) => {
    // receivedAt is when our server actually got this ping (from Mongo's
    // _id) - reliable regardless of the device's own clock, and what
    // drives the status badge below. The device's self-reported
    // "datetime" is only shown as a warning when it disagrees badly.
    const receivedAt = s.receivedAt ? new Date(s.receivedAt) : null;
    const deviceDate = s.lastData && s.lastData.datetime ? new Date(s.lastData.datetime) : null;

    let clockWarning = "";
    if (receivedAt && deviceDate && Math.abs(receivedAt.getTime() - deviceDate.getTime()) > CLOCK_MISMATCH_MS) {
      clockWarning = `<br><span class="small text-danger">device clock says ${deviceDate.toLocaleString()}</span>`;
    }

    rows += `
      <tr>
        <td>Shuttle#${s.shuttleNumber}</td>
        <td>${s.deviceId}</td>
        <td>${receivedAt ? receivedAt.toLocaleString() : "&mdash;"}${clockWarning}</td>
        <td>${receivedAt ? timeSince(receivedAt) : "&mdash;"}</td>
        <td>${statusBadge(receivedAt)}</td>
      </tr>`;
  });

  document.getElementById("statusTable").innerHTML =
    rows || '<tr><td colspan="5" class="text-center text-muted">No shuttles found</td></tr>';
}

loadStatus();
setInterval(loadStatus, REFRESH_INTERVAL_MS);
