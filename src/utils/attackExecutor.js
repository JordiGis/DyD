// src/utils/attackExecutor.js
import Swal from 'sweetalert2';
import { executeAttack as executeAttackLogic, executeCriticalAttack } from './attackLogic';
import { damageTypes, getColorForType } from './damageTypes';
import { rollRerollDice, replaceDice } from './attackLogic';

export function showAttackResult(attack, isCritical = false, criticalHitConfig = { rule: 'default', characterLevel: 1 }) {
    let attackResult;
    if (isCritical) {
        attackResult = executeCriticalAttack(attack, criticalHitConfig);
    } else {
        attackResult = executeAttackLogic(attack);
    }

    const getRollsHTML = (rolls) => {
        return rolls.map(r =>
            `<span class="roll-value ${r.isReplaced ? 'replaced' : ''}">${r.value}</span>`
        ).join(', ');
    };

    const getRerollResultsHTML = (rerollResults) => {
        if (!rerollResults) return '';
        let html = `<div class="reroll-results-block-modern"><h4><i class="bi bi-dice-5"></i> Resultados del Reroll</h4>`;
        for (const type in rerollResults) {
            html += `<div class="reroll-type"><strong>${type}:</strong> [${rerollResults[type].join(', ')}]</div>`;
        }
        html += '</div>';
        return html;
    };

    const renderModalContent = (result, rerollResults = null) => {
        let htmlResult = `<div class="attack-result-modal">`;
        htmlResult += `<h3 class="dnd-title-modern">${result.name}</h3>`;

        for (const type in result.results) {
            const data = result.results[type];
            const typeColor = getColorForType(type);
            const typeInfo = damageTypes.find(t => t.id === type) || { name: type };
            const typeName = typeInfo.name.toUpperCase();

            htmlResult += `
                <div class="damage-type-block-modern" style="border-left-color: ${typeColor};">
                    <div class="damage-header">
                        <span class="damage-type-modern" style="color: ${typeColor};">${typeName}</span>
                        <span class="damage-total-modern">${data.total}</span>
                    </div>
                    <div class="damage-details">
                        <span><strong>Tiradas:</strong> [${getRollsHTML(data.rolls)}]</span>
                        <span><strong>Bonus:</strong> ${data.bonus > 0 ? '+' : ''}${data.bonus}</span>
                    </div>
            `;
            if (data.lifeSteal) {
                htmlResult += `
                    <div class="lifesteal-details">
                        <i class="bi bi-heart-fill"></i>
                        <span><strong>Curado:</strong> ${data.lifeSteal.healed} (${data.lifeSteal.percentage_display})</span>
                    </div>
                `;
            }
            htmlResult += `</div>`;
        }

        htmlResult += getRerollResultsHTML(rerollResults);

        htmlResult += `<div class="grand-total-modern">Daño Total: ${result.grandTotal}</div>`;
        if (result.totalHealed > 0) {
            htmlResult += `<div class="total-healed-modern">Curación Total: ${result.totalHealed}</div>`;
        }
        htmlResult += `</div>`;
        return htmlResult;
    };

    let rerollData = null;
    let hasReplaced = false;

    Swal.fire({
        width: 600,
        html: renderModalContent(attackResult),
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        showDenyButton: attack.rerollDice && attack.rerollDice.length > 0,
        denyButtonText: 'Lanzar Reroll',
        showCancelButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'dnd-modern-swal-popup',
            htmlContainer: 'dnd-modern-swal-container',
            denyButton: 'dnd-reroll-button',
            cancelButton: 'dnd-replace-button',
        },
        didOpen: () => {
            const styleId = 'dnd-modern-modal-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .dnd-modern-swal-popup { background: #1e1e1e; border: 1px solid #444; border-radius: 10px; color: #f0f0f0; box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
                .dnd-modern-swal-container { padding: 0 !important; }
                .dnd-title-modern { font-family: 'Teko', sans-serif; font-size: 2.5rem; color: #f0f0f0; text-align: center; padding: 15px; background: #111; border-top-left-radius: 9px; border-top-right-radius: 9px; }
                .dnd-modern-swal-popup .attack-result-modal { padding: 20px; font-family: 'Roboto', sans-serif; }
                .damage-type-block-modern { background: #2a2a2a; border-left: 4px solid; margin-bottom: 15px; padding: 15px; border-radius: 4px; }
                .damage-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .damage-type-modern { font-family: 'Teko', sans-serif; font-size: 1.5rem; }
                .damage-total-modern { font-family: 'Teko', sans-serif; font-size: 2.8rem; color: #ff4d4d; }
                .grand-total-modern, .total-healed-modern { font-family: 'Teko', sans-serif; font-size: 2rem; text-align: center; margin-top: 20px; padding: 10px; border-radius: 5px; }
                .grand-total-modern { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; }
                .total-healed-modern { background: rgba(77, 255, 126, 0.1); color: #4dff7e; }
                .lifesteal-details { color: #4dff7e; }
                .roll-value.replaced { color: #ffd700; font-weight: bold; text-shadow: 0 0 5px #ffd700; background-color: rgba(255, 215, 0, 0.1); padding: 2px 4px; border-radius: 3px; }
                .reroll-results-block-modern { background: #2a2a2a; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #444; }
                .reroll-results-block-modern h4 { color: #f39c12; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
                .reroll-type { margin-bottom: 5px; padding-left: 10px; }
                .swal2-actions { gap: 15px !important; }
                .dnd-reroll-button { background-color: #9b59b6 !important; color: white !important; }
                .dnd-replace-button { background-color: #f39c12 !important; color: white !important; }`;
            document.head.appendChild(style);
        },
        preDeny: () => {
            rerollData = rollRerollDice(attack.rerollDice);
            hasReplaced = false;
            Swal.update({
                html: renderModalContent(attackResult, rerollData),
                showDenyButton: false,
                showCancelButton: false,
                footer: '<button id="swal-replace-btn" class="swal2-styled dnd-replace-button">Reemplazar Dados</button>',
            });

            setTimeout(() => {
                const replaceBtn = document.getElementById('swal-replace-btn');
                if (!replaceBtn) return;
                replaceBtn.onclick = () => {
                    if (!rerollData) {
                        rerollData = rollRerollDice(attack.rerollDice);
                    }
                    attackResult = replaceDice(attackResult, rerollData);
                    hasReplaced = true;
                    Swal.update({
                        html: renderModalContent(attackResult, rerollData),
                        showConfirmButton: true,
                        showDenyButton: false,
                        showCancelButton: false,
                        footer: ''
                    });
                };
            }, 0);
            return false;
        },
    });
}
