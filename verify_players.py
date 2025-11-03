import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()

        try:
            # 1. Navegar y abrir el modal
            await page.goto("http://localhost:8000/DyD/")

            dm_button = page.get_by_role("button", name="Panel del DM")
            await expect(dm_button).to_be_visible(timeout=10000)
            await dm_button.click()

            await page.get_by_role("button", name="Gestión de Jugadores").click()
            await expect(page.locator(".player-manager-content")).to_be_visible()

            # 2. Añadir jugadores
            await page.get_by_placeholder("Nombre del nuevo jugador").fill("Aragorn")
            await page.get_by_role("button", name="Añadir Jugador").click()
            await page.get_by_placeholder("Nombre del nuevo jugador").fill("Legolas")
            await page.get_by_role("button", name="Añadir Jugador").click()

            await expect(page.locator(".player-card", has_text="Aragorn")).to_be_visible()
            await expect(page.locator(".player-card", has_text="Legolas")).to_be_visible()

            # 3 & 4. Asignar XP
            aragorn_card = page.locator(".player-card", has_text="Aragorn")
            legolas_card = page.locator(".player-card", has_text="Legolas")

            await aragorn_card.get_by_placeholder("Añadir XP").fill("100")
            await aragorn_card.locator(".add-xp-single .btn-success").click()

            await legolas_card.get_by_placeholder("Añadir XP").fill("50")
            await legolas_card.locator(".add-xp-single .btn-success").click()

            # 5. Dar XP a todos
            await page.get_by_placeholder("XP para todos").fill("25")
            await page.get_by_role("button", name="Dar a Todos").click()

            # 6. Verificar totales
            await expect(aragorn_card.locator(".player-xp-total")).to_contain_text("125")
            await expect(legolas_card.locator(".player-xp-total")).to_contain_text("75")

            print("Verificación de XP inicial correcta.")

            # 7. Cerrar y reabrir modal para verificar persistencia
            await page.locator(".player-manager-header .btn-close").click()
            await expect(page.locator(".player-manager-content")).not_to_be_visible()

            await page.get_by_role("button", name="Gestión de Jugadores").click()
            await expect(page.locator(".player-manager-content")).to_be_visible()

            aragorn_card = page.locator(".player-card", has_text="Aragorn")
            legolas_card = page.locator(".player-card", has_text="Legolas")

            await expect(aragorn_card.locator(".player-xp-total")).to_contain_text("125")
            await expect(legolas_card.locator(".player-xp-total")).to_contain_text("75")

            print("Verificación de persistencia en la sesión correcta.")

            # 8. Iniciar nueva sesión y manejar el modal de éxito
            await page.get_by_role("button", name="Iniciar Nueva Sesión").click()
            await page.get_by_role("button", name="Sí, iniciar").click()

            # Esperar el modal de éxito y hacer clic en OK
            await expect(page.locator(".swal2-popup", has_text="¡Nueva sesión iniciada!")).to_be_visible()
            await page.get_by_role("button", name="OK").click()

            await expect(aragorn_card.locator(".player-xp-total")).to_contain_text("0")
            await expect(legolas_card.locator(".player-xp-total")).to_contain_text("0")

            print("Verificación de reseteo de sesión correcta.")

            # 9. Tomar captura de pantalla
            await page.screenshot(path="verification/player_manager_test.png")
            print("Prueba completada con éxito. Captura de pantalla guardada.")

        except Exception as e:
            print(f"Error durante la prueba: {e}")
            await page.screenshot(path="verification/player_manager_test_error.png")

        finally:
            await context.close()
            await browser.close()

asyncio.run(main())
