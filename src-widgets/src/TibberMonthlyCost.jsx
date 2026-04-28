import React from 'react';
import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';
import './style.css';

const PREV = '<div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:14px;width:260px;height:240px;font-family:sans-serif;color:#e0e6ef;box-sizing:border-box;display:flex;flex-direction:column"><div style="font-size:.6rem;text-transform:uppercase;letter-spacing:1px;text-align:center;opacity:.7;margin-bottom:6px;flex-shrink:0">&#9889; Monatskosten</div><div style="font-size:2.4rem;font-weight:700;text-align:center;color:#f39c12;margin-bottom:2px;flex-shrink:0">24.87 &#8364;</div><div style="font-size:.55rem;text-align:center;opacity:.55;margin-bottom:8px;flex-shrink:0">inkl. 8.90 &#8364; Grundgebühr</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;flex-shrink:0"><div style="background:rgba(255,255,255,.07);border-radius:8px;padding:7px;text-align:center"><div style="font-size:.5rem;opacity:.65;margin-bottom:2px">Verbrauch</div><div style="font-size:.82rem;font-weight:700;color:#3498db">87.3 kWh</div></div><div style="background:rgba(255,255,255,.07);border-radius:8px;padding:7px;text-align:center"><div style="font-size:.5rem;opacity:.65;margin-bottom:2px">&#216; Preis</div><div style="font-size:.82rem;font-weight:700;color:#9b59b6">28.5 ct</div></div><div style="background:rgba(255,255,255,.07);border-radius:8px;padding:7px;text-align:center"><div style="font-size:.5rem;opacity:.65;margin-bottom:2px">Prognose</div><div style="font-size:.82rem;font-weight:700;color:#e67e22">42.0 &#8364;</div></div></div><div style="background:rgba(255,255,255,.1);border-radius:4px;height:6px;overflow:hidden;margin-bottom:5px;flex-shrink:0"><div style="background:#27ae60;height:100%;width:60%;border-radius:4px"></div></div><div style="font-size:.55rem;text-align:center;opacity:.55;flex-shrink:0">18 / 30 Tage</div></div>';

class TibberMonthlyCost extends VisRxWidget {
    static getWidgetInfo() {
        return {
            id: 'tplTibberMonthlyCost',
            visSet: 'vis-2-widgets-tibberlink',
            visSetLabel: 'Tibberlink',
            visSetColor: '#27ae60',
            visName: 'Tibber Monthly Cost',
            visDefaultStyle: { width: 280, height: 260 },
            visPrev: PREV,
            visAttrs: [
                {
                    name: 'oids',
                    label: 'OIDs',
                    fields: [
                        { name: 'oid_jsonDaily', type: 'id', label: 'Daily JSON OID' },
                    ],
                },
                {
                    name: 'display',
                    label: 'Display',
                    fields: [
                        { name: 'tib_title',         type: 'text',     label: 'Title',           default: 'Monatskosten' },
                        { name: 'tib_darkmode',       type: 'checkbox', label: 'Dark mode',       default: true },
                        { name: 'currency_symbol',    type: 'text',     label: 'Currency symbol', default: '€' },
                        { name: 'show_base_fee',      type: 'checkbox', label: 'Include base fee', default: false },
                        { name: 'base_fee_per_month', type: 'number',   label: 'Monthly base fee', default: 0 },
                    ],
                },
            ],
        };
    }

    getWidgetInfo() {
        return TibberMonthlyCost.getWidgetInfo();
    }

    _aggregate(rawJson) {
        let rows = [];
        try { rows = JSON.parse(rawJson) || []; } catch (e) { /* ignore */ }

        const now         = new Date();
        const thisY       = now.getFullYear();
        const thisM       = now.getMonth();
        const today       = now.getDate();
        const daysInMonth = new Date(thisY, thisM + 1, 0).getDate();

        let totalCost = 0, totalKWh = 0, daysCount = 0;
        for (const r of rows) {
            if (!r || !r.from) continue;
            try {
                const dt = new Date(r.from);
                if (dt.getFullYear() === thisY && dt.getMonth() === thisM) {
                    totalCost += parseFloat(r.cost)        || 0;
                    totalKWh  += parseFloat(r.consumption) || 0;
                    daysCount++;
                }
            } catch (e) { /* ignore */ }
        }

        return { totalCost, totalKWh, daysCount, today, daysInMonth };
    }

    renderWidgetBody() {
        const { rxData, values } = this.state;

        const dark     = rxData.tib_darkmode !== false;
        const title    = rxData.tib_title        || 'Monatskosten';
        const currency = rxData.currency_symbol  || '€';
        const showBase = rxData.show_base_fee === true || rxData.show_base_fee === 'true';
        const baseFee  = parseFloat(rxData.base_fee_per_month) || 0;

        const rawJson = values[rxData.oid_jsonDaily + '.val'];
        const { totalCost, totalKWh, daysCount, today, daysInMonth } = this._aggregate(rawJson);

        const displayCost = totalCost + (showBase ? baseFee : 0);
        const avgCt       = totalKWh > 0.001 ? (totalCost / totalKWh) * 100 : null;
        const projection  = daysCount > 0
            ? (totalCost / daysCount) * daysInMonth + (showBase ? baseFee : 0)
            : null;

        let col;
        if (totalCost < 0.001) {
            col = '#95a5a6';
        } else if (projection !== null && today > 0) {
            const pace = (displayCost / projection) / (today / daysInMonth);
            col = pace > 1.2 ? '#e74c3c' : pace > 1.05 ? '#f39c12' : '#27ae60';
        } else {
            col = '#f39c12';
        }

        const pct = Math.min(100, Math.max(0, (today - 1) / daysInMonth * 100));

        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div className={`tib-mc-wrap${dark ? '' : ' light'}`}>
                    <div className="tib-mc-title">⚡ {title}</div>
                    <div className="tib-mc-big" style={{ color: col }}>
                        {displayCost > 0.001 ? `${displayCost.toFixed(2)} ${currency}` : `-- ${currency}`}
                    </div>
                    <div className="tib-mc-base">
                        {showBase && baseFee > 0 ? `inkl. ${baseFee.toFixed(2)} ${currency} Grundgebühr` : ''}
                    </div>
                    <div className="tib-mc-stats">
                        <div className="tib-stat-box">
                            <div className="tib-stat-label">Verbrauch</div>
                            <div className="tib-stat-val" style={{ color: '#3498db' }}>
                                {totalKWh > 0.001 ? `${totalKWh.toFixed(1)} kWh` : '-- kWh'}
                            </div>
                        </div>
                        <div className="tib-stat-box">
                            <div className="tib-stat-label">Ø Preis</div>
                            <div className="tib-stat-val" style={{ color: '#9b59b6' }}>
                                {avgCt !== null ? `${avgCt.toFixed(2)} ct` : '-- ct'}
                            </div>
                        </div>
                        <div className="tib-stat-box">
                            <div className="tib-stat-label">Prognose</div>
                            <div className="tib-stat-val" style={{ color: '#e67e22' }}>
                                {projection !== null ? `${projection.toFixed(2)} ${currency}` : `-- ${currency}`}
                            </div>
                        </div>
                    </div>
                    <div className="tib-mc-progress-wrap">
                        <div className="tib-mc-bar" style={{ width: `${pct.toFixed(1)}%` }} />
                    </div>
                    <div className="tib-mc-days">{today} / {daysInMonth} Tage</div>
                </div>
            </div>
        );
    }
}

export { TibberMonthlyCost };
export default TibberMonthlyCost;
