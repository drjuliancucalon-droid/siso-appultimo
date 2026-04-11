$project = "C:\Users\JQK3\Desktop\ocupasalud-ultimate"
$pagesDir = "$project\src\pages"
$count = 0

# Process each .jsx file in pages/
Get-ChildItem "$pagesDir\*.jsx" | ForEach-Object {
    $file = $_.FullName
    $name = $_.Name
    $content = Get-Content $file -Raw -Encoding UTF8

    # Skip files that don't use useApp
    if ($content -notmatch "useApp") {
        Write-Host "SKIP (no useApp): $name"
        return
    }

    $modified = $false

    # Step 1: Remove the import line for useApp
    if ($content -match "import\s*\{\s*useApp\s*\}\s*from\s*['""]\.\.\/context\/AppContext\.jsx['""];?\s*\r?\n") {
        $content = $content -replace "import\s*\{\s*useApp\s*\}\s*from\s*['""]\.\.\/context\/AppContext\.jsx['""];?\s*\r?\n", ""
        $modified = $true
    }

    # Step 2: Handle "const ctx = useApp();" pattern (LoginPage)
    # Replace: const ctx = useApp();
    # With: nothing (will use props)
    if ($content -match "const\s+ctx\s*=\s*useApp\(\);") {
        $content = $content -replace "const\s+ctx\s*=\s*useApp\(\);", ""
        # And replace destructuring from ctx with destructuring from props
        # e.g., "const { ... } = ctx;" -> "const { ... } = props;"
        $content = $content -replace "\}\s*=\s*ctx;", "} = props;"
        $modified = $true
    }

    # Step 3: Handle "} = useApp();" pattern (most pages)
    # Replace: } = useApp(); with } = props;
    if ($content -match "\}\s*=\s*useApp\(\);") {
        $content = $content -replace "\}\s*=\s*useApp\(\);", "} = props;"
        $modified = $true
    }

    # Step 4: Change function signature from () => { to (props) => {
    # Pattern: const ComponentName = () => {
    # We need to find the component definition. The component name matches the filename.
    $componentName = $name -replace "\.jsx$", ""
    
    # Try pattern: const ComponentName = () => {
    $escapedName = [regex]::Escape($componentName)
    if ($content -match "const\s+$escapedName\s*=\s*\(\)\s*=>\s*\{") {
        $content = $content -replace "(const\s+$escapedName\s*=\s*)\(\)(\s*=>\s*\{)", '${1}(props)${2}'
        $modified = $true
    }

    # Also handle: function ComponentName() { (unlikely but check)
    if ($content -match "function\s+$escapedName\s*\(\)\s*\{") {
        $content = $content -replace "(function\s+$escapedName)\s*\(\)(\s*\{)", '${1}(props)${2}'
        $modified = $true
    }

    # Special cases for files that already receive props (ChangePasswordForm, NotificacionModal)
    # ChangePasswordForm already receives props in renderCurrentView
    # NotificacionModal already receives { data, onCerrar } as props
    # For these, we already removed the import above, which is sufficient

    if ($modified) {
        Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
        $count++
        Write-Host "MODIFIED: $name"
    } else {
        Write-Host "NO CHANGE NEEDED: $name"
    }
}

Write-Host "`n=== Total files modified: $count ==="
