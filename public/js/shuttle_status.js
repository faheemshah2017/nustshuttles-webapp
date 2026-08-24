const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;   // 2 minutes
const IDLE_THRESHOLD_MS = 15 * 60 * 1000;    // 15 minutes
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;   // allow up to 5 minutes of clock drift
const REFRESH_INTERVAL_MS = 30 * 1000;       // 30 seconds

function timeSince(date) {
  const diffMs = Date.now() - date.getTime();
  if (diffMs < -FUTURE_TOLERANCE_MS) {
    return "clock skew (" + date.toLocaleDateString() + ")";
  }
  const seconds = Math.floor(Math.max(diffMs, 0) / 1000);
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
  if (age < -FUTURE_TOLERANCE_MS) {
    return '<span class="badge badge-dark" title="Device clock is reporting a time far in the future">Invalid Clock</span>';
  }
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
    const lastData = s.lastData;
    const lastDate = lastData && lastData.datetime ? new Date(lastData.datetime) : null;
    rows += `
      <tr>
        <td>Shuttle#${s.shuttleNumber}</td>
        <td>${s.deviceId}</td>
        <td>${lastDate ? lastDate.toLocaleString() : "&mdash;"}</td>
        <td>${lastDate ? timeSince(lastDate) : "&mdash;"}</td>
        <td>${statusBadge(lastDate)}</td>
      </tr>`;
  });

  document.getElementById("statusTable").innerHTML =
    rows || '<tr><td colspan="5" class="text-center text-muted">No shuttles found</td></tr>';
}

loadStatus();
setInterval(loadStatus, REFRESH_INTERVAL_MS);
