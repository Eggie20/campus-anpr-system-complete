$ErrorActionPreference = "Stop"

Write-Host "=========================================="
Write-Host "  CAMPUS ANPR - SYSTEM SMOKE CHECK"
Write-Host "=========================================="

function Test-Http([string]$Name, [string]$Url) {
    try {
        $resp = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) {
            Write-Host "[OK] $Name -> $($resp.StatusCode) ($Url)"
            return $true
        }
        Write-Host "[FAIL] $Name -> HTTP $($resp.StatusCode) ($Url)"
        return $false
    } catch {
        Write-Host "[FAIL] $Name -> $($_.Exception.Message)"
        return $false
    }
}

$checks = @(
    @{ Name = "Backend Health"; Url = "http://localhost:8000/health" },
    @{ Name = "Backend Docs"; Url = "http://localhost:8000/docs" },
    @{ Name = "ANPR Engine Docs"; Url = "http://localhost:8003/api/docs" },
    @{ Name = "Frontend Home"; Url = "http://localhost:3000" }
)

$ok = 0
foreach ($c in $checks) {
    if (Test-Http -Name $c.Name -Url $c.Url) {
        $ok += 1
    }
}

Write-Host ""
Write-Host "Result: $ok / $($checks.Count) checks passed"
if ($ok -eq $checks.Count) {
    Write-Host "[READY] Core services are reachable."
    exit 0
}

Write-Host "[ACTION] Start services with scripts\run_app.bat and re-run this check."
exit 1
