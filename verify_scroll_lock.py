import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        screenshot_path = "verification/scroll_lock_test.png"

        try:
            # 1. Navegar a la página
            await page.goto("http://localhost:8000/DyD/")
            body = page.locator('body')

            # 2. Verificar estado inicial del scroll
            await expect(body).not_to_have_css("overflow", "hidden")
            print("Verificación inicial: Scroll no está bloqueado.")

            # 3. Abrir el modal
            dm_button = page.get_by_role("button", name="Panel del DM")
            await expect(dm_button).to_be_visible(timeout=10000)
            await dm_button.click()

            await page.get_by_role("button", name="Gestión de Jugadores").click()
            await expect(page.locator(".player-manager-content")).to_be_visible()

            # 4. Verificar que el scroll está bloqueado
            await expect(body).to_have_css("overflow", "hidden")
            print("Verificación modal abierto: Scroll está bloqueado.")

            # 5. Cerrar el modal
            await page.locator(".player-manager-header .btn-close").click()
            await expect(page.locator(".player-manager-content")).not_to_be_visible()

            # 6. Verificar que el scroll se ha restaurado
            await expect(body).not_to_have_css("overflow", "hidden")
            print("Verificación modal cerrado: Scroll se ha restaurado.")

            # 7. Reabrir para tomar la captura de pantalla
            await page.get_by_role("button", name="Gestión de Jugadores").click()
            await expect(page.locator(".player-manager-content")).to_be_visible()
            await page.screenshot(path=screenshot_path)
            print(f"Prueba completada con éxito. Captura de pantalla guardada en {screenshot_path}")

        except Exception as e:
            print(f"Error durante la prueba: {e}")
            await page.screenshot(path="verification/scroll_lock_error.png")

        finally:
            await context.close()
            await browser.close()

asyncio.run(main())
