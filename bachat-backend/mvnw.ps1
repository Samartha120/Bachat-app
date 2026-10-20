param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsList
)

$ErrorActionPreference = "Stop"
$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WrapperJar = Join-Path $CurrentDir ".mvn\wrapper\maven-wrapper.jar"

if (-not (Test-Path $WrapperJar)) {
    Write-Error "Could not find $WrapperJar"
    exit 1
}

java "-Dmaven.multiModuleProjectDirectory=$CurrentDir" -cp "$WrapperJar" org.apache.maven.wrapper.MavenWrapperMain @ArgsList
