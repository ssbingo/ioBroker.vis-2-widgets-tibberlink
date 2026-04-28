export function levelColor(level) {
    switch ((level || '').toUpperCase()) {
        case 'VERY_CHEAP':      return '#1abc9c';
        case 'CHEAP':           return '#27ae60';
        case 'NORMAL':          return '#f39c12';
        case 'EXPENSIVE':       return '#e67e22';
        case 'VERY_EXPENSIVE':  return '#e74c3c';
        default:                return '#95a5a6';
    }
}

export function levelText(level) {
    switch ((level || '').toUpperCase()) {
        case 'VERY_CHEAP':      return 'Sehr günstig';
        case 'CHEAP':           return 'Günstig';
        case 'NORMAL':          return 'Normal';
        case 'EXPENSIVE':       return 'Teuer';
        case 'VERY_EXPENSIVE':  return 'Sehr teuer';
        default:                return level || '--';
    }
}

export function fmtW(v) {
    const n = parseFloat(v);
    if (isNaN(n)) return '-- W';
    if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(2)} kW`;
    return `${Math.round(n)} W`;
}

export function fmtKWh(v) {
    const n = parseFloat(v);
    return isNaN(n) ? '-- kWh' : `${n.toFixed(3)} kWh`;
}

export function fmtCost(v, sym) {
    const n = parseFloat(v);
    return isNaN(n) ? `-- ${sym || '€'}` : `${n.toFixed(2)} ${sym || '€'}`;
}

export function fmtTime(iso) {
    try {
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
        return '--:--';
    }
}

export function slotColor(level, inWin) {
    if (inWin) return '#27ae60';
    switch ((level || '').toUpperCase()) {
        case 'VERY_CHEAP':      return '#1abc9c';
        case 'CHEAP':           return '#52d68a';
        case 'NORMAL':          return '#7f8c8d';
        case 'EXPENSIVE':       return '#f39c12';
        case 'VERY_EXPENSIVE':  return '#e74c3c';
        default:                return '#7f8c8d';
    }
}
