# Ejecutar desde la raíz del repo chatbot-latam
# Este script corre pruebas de recuperación FAISS para cada pregunta del JSONL

$questionsPath = "knowledge_base/eval/questions_daniel.jsonl"
$outputDir = "docs/evidencias/eval_questions"
$topK = 5

if (-not (Test-Path $questionsPath)) {
    Write-Error "No se encontró $questionsPath. Ejecuta este script desde la raíz del repo."
    exit 1
}

if (-not (Test-Path "scripts/test_faiss_retrieval.py")) {
    Write-Error "No se encontró scripts/test_faiss_retrieval.py. Ejecuta este script desde la raíz del repo."
    exit 1
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Get-Content $questionsPath -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line) { return }

    try {
        $q = $line | ConvertFrom-Json
    }
    catch {
        Write-Warning "Línea inválida en JSONL. Se omite: $line"
        return
    }

    $outFile = Join-Path $outputDir ("{0}.txt" -f $q.id)

    @(
        "ID: $($q.id)",
        "Tema: $($q.topic)",
        "Pregunta: $($q.question)",
        "Sección esperada: $($q.expected_section)",
        "Top-K: $topK",
        "",
        "===== RESULTADO DE RECUPERACION =====",
        ""
    ) | Set-Content -Path $outFile -Encoding UTF8

    python scripts/test_faiss_retrieval.py "$($q.question)" --top-k $topK 2>&1 | Add-Content -Path $outFile -Encoding UTF8

    Write-Host "OK $($q.id): evidencia guardada en $outFile"
}

Write-Host "Proceso terminado. Revisa $outputDir"
