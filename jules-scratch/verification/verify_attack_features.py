
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            await page.goto("http://localhost:5173/DyD/")

            # Wait for the "Gestor de Ataques" button to be ready
            await page.wait_for_selector("text=Gestor de Ataques", state="visible")

            # Open the attack manager
            await page.click("text=Gestor de Ataques")

            # Wait for the attack manager to be visible
            await page.wait_for_selector(".attack-manager-container")

            # Create a new attack to duplicate and sort
            await page.click("text=Crear Nuevo Ataque")
            await page.wait_for_selector(".attack-form")
            await page.fill("input[placeholder='Ej: Espadazo flamígero']", "Test Attack")
            await page.click("text=Crear Ataque")

            # Duplicate the attack
            await page.click("button.btn-duplicate")

            # Verify that the duplicated attack exists
            await page.wait_for_selector("text=Test Attack (Copia)")

            # Reorder the attacks
            source = await page.query_selector(".attack-item[data-id]")
            target = await page.query_selector_all(".attack-item[data-id]")

            if source and len(target) > 1:
                await source.drag_to(target[1])

            # Take a screenshot
            await page.screenshot(path="jules-scratch/verification/verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
