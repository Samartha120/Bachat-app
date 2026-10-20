@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script for Bachat Backend (Windows)
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL EnableExtensions EnableDelayedExpansion

SET "DIRNAME=%~dp0"
IF "%DIRNAME:~-1%"=="\" SET "DIRNAME=%DIRNAME:~0,-1%"
IF "%DIRNAME%" == "" SET "DIRNAME=."

IF NOT DEFINED JAVA_HOME (
  FOR /F "tokens=*" %%i in ('where java 2^>nul') do (
    SET "JAVA_EXE=%%i"
    GOTO :found_java
  )
  ECHO Error: Java executable not found. Please ensure Java 17+ is installed and on PATH. >&2
  EXIT /B 1
) ELSE (
  SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

:found_java
SET "WRAPPER_JAR=%DIRNAME%\.mvn\wrapper\maven-wrapper.jar"

IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Error: Could not find %WRAPPER_JAR% >&2
  EXIT /B 1
)

"%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=%DIRNAME%" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
