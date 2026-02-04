@echo off
echo ZETA BUILD TEST
echo.
echo Konum: %CD%
echo.

if exist "frontend\" (
    echo [OK] frontend klasoru var
) else (
    echo [HATA] frontend klasoru yok!
)

if exist "backend\" (
    echo [OK] backend klasoru var
) else (
    echo [HATA] backend klasoru yok!
)

echo.
echo Bu pencere acik kalacak...
pause
