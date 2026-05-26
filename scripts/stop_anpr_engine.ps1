# Stop processes listening on (or using) TCP port 8003 - SMART-PLATE / uvicorn
$ErrorActionPreference = 'SilentlyContinue'

$pids = @()
$pids += @(Get-NetTCPConnection -LocalPort 8003 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess)

if (-not $pids -or @($pids).Count -eq 0) {
    $pids = @(Get-NetTCPConnection -LocalPort 8003 -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess)
}

$pids = @($pids | Where-Object { $_ -gt 0 } | Select-Object -Unique)

if ($pids.Count -eq 0) {
    exit 2
}

foreach ($procId in $pids) {
    Write-Host "[STOP] PID $procId"
    try {
        Stop-Process -Id $procId -Force -ErrorAction Stop
        Write-Host "[OK] Stopped $procId"
    }
    catch {
        Write-Host "[WARN] Could not stop $procId - try Run as administrator"
    }
}
exit 0
