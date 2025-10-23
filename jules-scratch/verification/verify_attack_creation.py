
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        time.sleep(10)  # Add a 10-second delay
        page.goto("http://localhost:5173/DyD/")
        page.click("text=Gestor de Ataques")
        page.click("text=Crear Nuevo Ataque")
        page.fill("input[placeholder='Ej: Espadazo flamígero']", "Test Attack")
        page.click("text=Crear Ataque")
        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
