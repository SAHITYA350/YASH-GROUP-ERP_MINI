# ============================================================================
# RBAC test matrix - Module 6 (Finance & Commercial)
# Run with:  powershell -ExecutionPolicy Bypass -File scripts\test-rbac.ps1
# Requires the API to be running:  npm start   (http://localhost:5000)
#
# Expected results (from the Module 6 spec):
#   Admin opens finance dashboard            -> 200
#   Finance manager approves a vendor bill   -> 200
#   Accountant creates an invoice            -> 201
#   Sales manager approves a vendor bill     -> 403
#   Viewer creates an invoice                -> 403
#   Unauthenticated user opens protected API -> 401
# ============================================================================

$base = "http://localhost:5000"
$pw   = "Yash@Test123"   # SEED_TEST_PASSWORD from server\.env

# Reset the two records this script mutates so the matrix can be re-run.
node "$PSScriptRoot\reset-test-data.js"

function Login($email) {
    $body = @{ email = $email; password = $pw } | ConvertTo-Json
    $r = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType "application/json" -Body $body
    return $r.token
}

function Call($method, $path, $token, $body = "") {
    $args = @("-s", "-o", "NUL", "-w", "%{http_code}", "-X", $method, "$base$path")
    if ($token) { $args += @("-H", "Authorization: Bearer $token") }
    if ($body)  { $args += @("-H", "Content-Type: application/json", "-d", $body) }
    return (& curl.exe @args)
}

$results = @()

# ---- login all 5 test users ----
$adminTok      = Login "admin@yash.test"
$financeTok    = Login "finance@yash.test"
$accountantTok = Login "accountant@yash.test"
$salesTok      = Login "sales@yash.test"
$viewerTok     = Login "viewer@yash.test"

Write-Output "Logins OK (5 tokens received).`n"

# ---- find the SUBMITTED expense bill to test approval ----
$bills = Invoke-RestMethod -Method Get -Uri "$base/api/finance/vendor-bills" -Headers @{ Authorization = "Bearer $financeTok" }
$expBill = $bills | Where-Object { $_.billNo -eq "EXP-CONSUMABLE-001" }

# ---- run the test matrix ----
$cases = @(
    @{ Name = "Unauthenticated user opens protected API"; Expected = 401; Method = "GET";  Path = "/api/finance/dashboard";                          Token = $null },
    @{ Name = "Admin opens finance dashboard";            Expected = 200; Method = "GET";  Path = "/api/finance/dashboard";                          Token = $adminTok },
    @{ Name = "Finance manager opens dashboard";          Expected = 200; Method = "GET";  Path = "/api/finance/dashboard";                          Token = $financeTok },
    @{ Name = "Accountant opens dashboard";               Expected = 200; Method = "GET";  Path = "/api/finance/dashboard";                          Token = $accountantTok },
    @{ Name = "Viewer opens dashboard";                   Expected = 200; Method = "GET";  Path = "/api/finance/dashboard";                          Token = $viewerTok },
    @{ Name = "Sales manager opens dashboard";            Expected = 403; Method = "GET";  Path = "/api/finance/dashboard";                          Token = $salesTok },
    @{ Name = "Sales manager approves a vendor bill";     Expected = 403; Method = "POST"; Path = "/api/finance/vendor-bills/$($expBill.id)/approve"; Token = $salesTok },
    @{ Name = "Viewer approves a vendor bill";            Expected = 403; Method = "POST"; Path = "/api/finance/vendor-bills/$($expBill.id)/approve"; Token = $viewerTok },
    @{ Name = "Accountant approves a vendor bill";        Expected = 403; Method = "POST"; Path = "/api/finance/vendor-bills/$($expBill.id)/approve"; Token = $accountantTok },
    @{ Name = "Finance manager approves a vendor bill";   Expected = 200; Method = "POST"; Path = "/api/finance/vendor-bills/$($expBill.id)/approve"; Token = $financeTok },
    @{ Name = "Viewer creates an invoice";                Expected = 403; Method = "POST"; Path = "/api/finance/invoices";                          Token = $viewerTok },
    @{ Name = "Sales manager creates an invoice";         Expected = 403; Method = "POST"; Path = "/api/finance/invoices";                          Token = $salesTok },
    @{ Name = "Accountant creates an invoice";            Expected = 201; Method = "POST"; Path = "/api/finance/invoices";                          Token = $accountantTok; Body = '{\"invoiceNo\":\"INV-API-TEST-001\",\"customerId\":1,\"salesOrderId\":1,\"subtotal\":\"10000\",\"taxAmount\":\"1800\",\"dueDate\":\"2026-11-30\"}' },
    @{ Name = "Viewer lists invoices (read is allowed)";  Expected = 200; Method = "GET";  Path = "/api/finance/invoices";                          Token = $viewerTok }
)

$fail = 0
foreach ($c in $cases) {
    $got = Call $c.Method $c.Path $c.Token $c.Body
    $ok  = [string]$got -eq [string]$c.Expected
    if (-not $ok) { $fail++ }
    $mark = if ($ok) { "PASS" } else { "FAIL" }
    Write-Output ("{0}  [{1}/{2}]  {3}" -f $mark, $got, $c.Expected, $c.Name)
}

Write-Output "`n----------------------------------------"
Write-Output "Job costing check (JOB-TEST-001):"
$jobs = Invoke-RestMethod -Method Get -Uri "$base/api/finance/jobs" -Headers @{ Authorization = "Bearer $financeTok" }
$job = $jobs | Where-Object { $_.projectCode -eq "JOB-TEST-001" }
Write-Output ("  revenue {0} | material {1} | logistics {2} | other {3}" -f $job.revenue, $job.materialCost, $job.logisticsCost, $job.otherCost)
Write-Output ("  profit {0} | margin {1}%" -f $job.profit, $job.margin)
Write-Output "  expected: revenue 200000 | material 80000 | logistics 10000 | other 20000 | profit 90000 | margin 45"
Write-Output "----------------------------------------"

if ($fail -gt 0) {
    Write-Output "RESULT: $fail test(s) FAILED"
    exit 1
}
Write-Output "RESULT: all tests PASSED"
