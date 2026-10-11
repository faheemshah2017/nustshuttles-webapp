const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;   // 2 minutes
const IDLE_THRESHOLD_MS = 15 * 60 * 1000;    // 15 minutes
const CLOCK_MISMATCH_MS = 24 * 60 * 60 * 1000; // flag device clock if off by more than a day
const REFRESH_INTERVAL_MS = 30 * 1000;       // 30 seconds
const EXPECTED_INTERVAL_SECONDS = 20;        // trackers normally report about every 20s

// Last known ping-to-ping gap per shuttle, kept across refreshes. Only
// updated while a shuttle is Online; frozen at its last value otherwise,
// so an Idle/Offline shuttle keeps showing how fast it *was* updating
// instead of a stale/meaningless gap from whenever it stopped.
const lastKnownGapMs = {};

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return seconds + "s";
  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;
  if (minutes < 60) return minutes + "m " + remSeconds + "s";
  const hours = Math.floor(minutes / 60);
  return hours + "h " + (minutes % 60) + "m";
}

function intervalCell(deviceId, status, lastGapMs) {
  if (status === "online" && lastGapMs != null) {
    lastKnownGapMs[deviceId] = lastGapMs;
  }

  const ms = lastKnownGapMs[deviceId];
  if (ms == null) {
    return '<span class="text-muted">Not enough data</span>';
  }

  const seconds = ms / 1000;
  let badgeClass = "badge-success";
  if (seconds > EXPECTED_INTERVAL_SECONDS * 4) {
    badgeClass = "badge-danger";
  } else if (seconds > EXPECTED_INTERVAL_SECONDS * 2) {
    badgeClass = "badge-warning";
  }

  const frozenNote = status === "online" ? "" : ' <span class="small text-muted">(while last online)</span>';
  return `<span class="badge ${badgeClass}">${formatDuration(ms)}</span>${frozenNote}`;
}

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

function statusOf(date) {
  if (!date) return "never";
  const age = Date.now() - date.getTime();
  if (age <= ONLINE_THRESHOLD_MS) return "online";
  if (age <= IDLE_THRESHOLD_MS) return "idle";
  return "offline";
}

function statusBadge(status) {
  if (status === "never") return '<span class="badge badge-secondary">Never</span>';
  if (status === "online") return '<span class="badge badge-success">Online</span>';
  if (status === "idle") return '<span class="badge badge-warning">Idle</span>';
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
    ("" + a.shuttleNumber).localeCompare("" + b.shuttleNumber, undefined, { numeric: true })
  );

  let rows = "";
  statuses.forEach((s) => {
    // receivedAt is when our server actually got this ping (from Mongo's
    // _id) - reliable regardless of the device's own clock, and what
    // drives the status below. The device's self-reported "datetime" is
    // only shown as a warning when it disagrees badly.
    const receivedAt = s.receivedAt ? new Date(s.receivedAt) : null;
    const deviceDate = s.lastData && s.lastData.datetime ? new Date(s.lastData.datetime) : null;
    const status = statusOf(receivedAt);

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
        <td>${intervalCell(s.deviceId, status, s.lastGapMs)}</td>
        <td>${statusBadge(status)}</td>
      </tr>`;
  });

  document.getElementById("statusTable").innerHTML =
    rows || '<tr><td colspan="6" class="text-center text-muted">No shuttles found</td></tr>';
}

loadStatus();
setInterval(loadStatus, REFRESH_INTERVAL_MS);
