
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5173/DyD/")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)

    # Click the "Crear Personaje" button to navigate to the character creation form
    page.click("text=Crear Personaje")

    # Now on the character creation form, fill it out and submit
    page.fill("input[placeholder='Nombre del personaje']", "Test Character")
    page.click("text=Crear Personaje")

    # Open the attack manager
    page.click("text=Gestor de Ataques")

    # Click the "Crear Nuevo Ataque" button
    page.click("text=Crear Nuevo Ataque")

    # Click the "Añadir dado de reroll" button
    page.click("text=Añadir dado de reroll")

    # Take a screenshot of the form
    page.screenshot(path="jules-scratch/verification/reroll_.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
