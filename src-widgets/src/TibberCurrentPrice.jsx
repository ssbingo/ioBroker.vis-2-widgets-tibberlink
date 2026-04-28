import React from 'react';
import { levelColor, levelText } from './utils';
import './styleInjector.js';

const PREV = '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:14px;width:260px;height:180px;font-family:sans-serif;color:#e0e6ef;box-sizing:border-box;display:flex;flex-direction:column"><div style="font-size:.6rem;text-transform:uppercase;letter-spacing:1px;text-align:center;opacity:.7;margin-bottom:8px">&#9889; Tibber Strompreis</div><div style="font-size:2.4rem;font-weight:700;text-align:center;color:#27ae60;margin-bottom:8px">12.34 ct/kWh</div><div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px"><span style="background:#27ae60;color:#fff;padding:3px 14px;border-radius:10px;font-size:.7rem;font-weight:600">Günstig</span><span style="font-size:.6rem;opacity:.6">14:00 Uhr</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;flex:1"><div style="background:rgba(255,255,255,.07);border-radius:8px;padding:8px;text-align:center"><div style="font-size:.55rem;opacity:.65;margin-bottom:3px">Energieanteil</div><div style="font-size:.88rem;font-weight:700;color:#3498db">8.02 ct</div></div><div style="background:rgba(255,255,255,.07);border-radius:8px;padding:8px;text-align:center"><div style="font-size:.55rem;opacity:.65;margin-bottom:3px">Steuer/Abgaben</div><div style="font-size:.88rem;font-weight:700;color:#9b59b6">4.32 ct</div></div></div></div>';

class TibberCurrentPrice extends window.visRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplTibberCurrentPrice',
            visSet: 'vis-2-widgets-tibberlink',
            visSetLabel: 'Tibberlink',
            visSetColor: '#27ae60',
            visName: 'Current Tibber Price',
            visDefaultStyle: { width: 280, height: 200 },
            visPrev: PREV,
            visAttrs: [
                {
                    name: 'oids',
                    label: 'OIDs',
                    fields: [
                        { name: 'oid_total',    type: 'id', label: 'Total Price OID' },
                        { name: 'oid_energy',   type: 'id', label: 'Energy Price OID' },
                        { name: 'oid_tax',      type: 'id', label: 'Tax OID' },
                        { name: 'oid_level',    type: 'id', label: 'Price Level OID' },
                        { name: 'oid_startsAt', type: 'id', label: 'Price slot start OID' },
                    ],
                },
                {
                    name: 'display',
                    label: 'Display',
                    fields: [
                        { name: 'tib_title',      type: 'text',     label: 'Title',                     default: 'Tibber Strompreis' },
                        { name: 'tib_darkmode',   type: 'checkbox', label: 'Dark mode',                 default: true },
                        { name: 'show_breakdown', type: 'checkbox', label: 'Show energy/tax breakdown', default: true },
                        { name: 'currency',       type: 'text',     label: 'Price unit label',          default: 'ct/kWh' },
                    ],
                },
            ],
        };
    }

    getWidgetInfo() {
        return TibberCurrentPrice.getWidgetInfo();
    }

    renderWidgetBody() {
        const { rxData, values } = this.state;

        const total    = values[rxData.oid_total    + '.val'];
        const energy   = values[rxData.oid_energy   + '.val'];
        const tax      = values[rxData.oid_tax      + '.val'];
        const level    = String(values[rxData.oid_level    + '.val'] || '');
        const startsAt = values[rxData.oid_startsAt + '.val'];

        const dark          = rxData.tib_darkmode !== false;
        const currency      = rxData.currency     || 'ct/kWh';
        const title         = rxData.tib_title    || 'Tibber Strompreis';
        const showBreakdown = rxData.show_breakdown !== false;

        const pv  = parseFloat(total);
        const col = levelColor(level);
        const priceStr = isNaN(pv) ? `-- ${currency}` : `${(pv * 100).toFixed(2)} ${currency}`;

        let timeStr = '';
        if (startsAt) {
            try {
                const dt = new Date(startsAt);
                timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')} Uhr`;
            } catch (e) { /* ignore */ }
        }

        const ev = parseFloat(energy);
        const tv = parseFloat(tax);

        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div className={`tib-pc-wrap${dark ? '' : ' light'}`}>
                    <div className="tib-pc-title">⚡ {title}</div>
                    <div className="tib-pc-big" style={{ color: col }}>{priceStr}</div>
                    <div className="tib-pc-badge-row">
                        <span className="tib-pc-badge" style={{ background: col }}>{levelText(level)}</span>
                        <span className="tib-pc-time">{timeStr}</span>
                    </div>
                    {showBreakdown && (
                        <div className="tib-pc-details">
                            <div className="tib-stat-box">
                                <div className="tib-stat-label">Energieanteil</div>
                                <div className="tib-stat-val" style={{ color: '#3498db' }}>
                                    {isNaN(ev) ? '-- ct' : `${(ev * 100).toFixed(2)} ct`}
                                </div>
                            </div>
                            <div className="tib-stat-box">
                                <div className="tib-stat-label">Steuer/Abgaben</div>
                                <div className="tib-stat-val" style={{ color: '#9b59b6' }}>
                                    {isNaN(tv) ? '-- ct' : `${(tv * 100).toFixed(2)} ct`}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export { TibberCurrentPrice };
export default TibberCurrentPrice;
