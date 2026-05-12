$source = "C:\Users\Legion\Documents\IllyrianCycling\index.html"
$backupDir = "C:\Users\Legion\Documents\IllyrianCycling\backups"
if (!(Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
Copy-Item $source "$backupDir\index_$timestamp.html"
