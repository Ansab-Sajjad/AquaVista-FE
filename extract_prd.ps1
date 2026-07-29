$path = 'c:\Users\ansab\Downloads\AquaVista_PoC_PRD (1).docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($path)
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$text = $xml -replace '</w:p>', "`n" -replace '<[^>]+>', ''
$text | Set-Content -Path 'c:\Users\ansab\OneDrive\Desktop\gogo-next-mui-admin\prd.txt' -Encoding UTF8
Write-Host "Extracted to prd.txt"
