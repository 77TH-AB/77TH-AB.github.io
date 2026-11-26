function showMenuModal() {
    let menuModalBg = document.getElementById('menu-modal-bg');
    if (!menuModalBg) {
        menuModalBg = document.createElement('div');
        menuModalBg.id = 'menu-modal-bg';
        menuModalBg.className = 'menu-modal-bg';
        document.body.appendChild(menuModalBg);
    }
    menuModalBg.innerHTML = `<div class="menu-modal">
                    <button class="menu-modal-close" aria-label="Close">&times;</button>
                    <h2 style='color:#dbab10;'>Menu</h2>
                    <div style='margin:1.2rem 0;'>
                        <button class='menu-btn' id='menu-home'>Home</button><br><br>
                        <button class='menu-btn' id='menu-roster'>Official Roster</button><br><br>
                        <button class='menu-btn' id='menu-report'>War Room</button><br><br>
                        <!-- Major Orders button removed -->
                        <button class='menu-btn' id='menu-join'>Joining Up</button>
                    </div>
                </div>`;
    menuModalBg.querySelector('#menu-home').onclick = function () {
        window.location.hash = '#home';
        closeMenuModal();
    };
    menuModalBg.querySelector('#menu-roster').onclick = function () {
        window.location.hash = '#roster';
        closeMenuModal();
    };
    menuModalBg.querySelector('#menu-report').onclick = function () {
        window.location.hash = '#report';
        closeMenuModal();
    };
    menuModalBg.querySelector('#menu-join').onclick = function () {
        window.location.hash = '#join';
        closeMenuModal();
    };
    menuModalBg.style.display = 'block';
    setTimeout(() => { menuModalBg.style.opacity = 1; }, 10);
    menuModalBg.querySelector('.menu-modal-close').onclick = closeMenuModal;
    menuModalBg.onclick = function (e) {
        if (e.target === menuModalBg) closeMenuModal();
    };
}
function closeMenuModal() {
    const menuModalBg = document.getElementById('menu-modal-bg');
    if (menuModalBg) {
        menuModalBg.style.opacity = 0;
        setTimeout(() => {
            menuModalBg.style.display = 'none';
            menuModalBg.innerHTML = '';
        }, 200);
    }
}
document.getElementById('menu-modal-btn').onclick = showMenuModal;
let rosterData = [];

function ensureRosterData() {
    if (window.rosterData && Array.isArray(window.rosterData) && window.rosterData.length > 0) {
        return Promise.resolve(window.rosterData);
    }
    return fetch('https://77th-ab.github.io/data/roster.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch roster data');
            return res.json();
        })
        .then(data => {
            window.rosterData = data;
            return data;
        })
        .catch(e => {
            window.rosterData = [];
            return [];
        });
}

function getDivisionCompanies(divisionTag, roster) {
    if (!Array.isArray(roster)) return [];
    const division = roster.find(div => div.tag === divisionTag);
    return division && Array.isArray(division.companies) ? division.companies : [];
}

function countNonVacantMembers(company) {
    if (!company || !Array.isArray(company.squads)) return 0;
    let count = 0;
    company.squads.forEach(squad => {
        if (Array.isArray(squad.members)) {
            squad.members.forEach(member => {
                if (member[0] && member[0].toLowerCase() !== 'vacant') {
                    count++;
                }
            });
        }
    });
    return count;
}

function getFactionClass(faction) {
    if (!faction) return '';
    const f = faction.toLowerCase();
    if (f.includes('automatons')) return 'automatons';
    if (f.includes('terminids')) return 'terminids';
    if (f.includes('illuminates')) return 'illuminates';
    return '';
}

async function fetchRoster() {
    const url = 'https://77th-ab.github.io/data/roster.json';
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch roster data');
        return await res.json();
    } catch (e) {
        document.getElementById('roster').innerHTML = `<div style='color:red;'>Error loading roster data.</div>`;
        return null;
    }
}

function createDivisionCard(division, idx) {
    return `
        <div class="division-card" data-idx="${idx}" tabindex="0" aria-label="${division.name} (${division.tag})">
            <div class="division-title">${division.name} <span style="font-size:0.9rem;color:#aaa;">(${division.tag})</span></div>
            <div class="division-commander">Division Commander: ${division.commander[0]} (${division.commander[1]})</div>
            <div class="division-deployment">Deployment: <b>${division.deployment.focus}</b></div>
        </div>
        `;
}

function createDivisionModal(division) {
    return `
        <button class="modal-close" aria-label="Close">&times;</button>
        <h2>${division.name} <span style="font-size:0.9rem;color:#aaa;">(${division.tag})</span></h2>
        <div class="commander">Division Commander: ${division.commander[0].toLowerCase() === 'vacant'
            ? `<a href=\"#join\" class=\"vacant-link\" title=\"Join Up\" onclick=\"closeModal()\">Vacant</a>`
            : division.commander[0]
        } (${division.commander[1]})</div>
        <div class="deployment">Deployment: <b>${division.deployment.focus}</b></div>
        <hr style="border:1px solid #dbab10; margin:1rem 0;">
        <div class="company-list">
            ${division.companies.map(company => `
                <div class="company">
                    <h3>${company.name} <span style="font-size:0.9rem;color:#aaa;">(${company.tag})</span></h3>
                    <div class="commander">CO: ${company.commander[0].toLowerCase() === 'vacant'
                ? `<a href=\"#join\" class=\"vacant-link\" title=\"Join Up\" onclick=\"closeModal()\">Vacant</a>`
                : company.commander[0]
            } (${company.commander[1]})</div>
                    ${company.squads.map(squad => `
                        <div class="squad">
                            <div class="squad-name">${squad.name}</div>
                            <ul class="members">
                                ${squad.members.map(member => {
                if (member[0].toLowerCase() === 'vacant') {
                    return `<li><a href="#join" class="vacant-link" title="Join Up" onclick="closeModal()">Vacant</a> (${member[1]})</li>`;
                } else {
                    return `<li>${member[0]} (${member[1]})</li>`;
                }
            }).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        `;
}

function showModal(division) {
    const modalBg = document.getElementById('modal-bg');
    modalBg.innerHTML = `<div class="modal">${createDivisionModal(division)}</div>`;
    modalBg.style.display = 'block';
    setTimeout(() => { modalBg.style.opacity = 1; }, 10);
    modalBg.querySelector('.modal-close').onclick = closeModal;
    document.addEventListener('keydown', escListener);
    modalBg.onclick = function (e) {
        if (e.target === modalBg) closeModal();
    };
}

function closeModal() {
    const modalBg = document.getElementById('modal-bg');
    modalBg.style.opacity = 0;
    setTimeout(() => {
        modalBg.style.display = 'none';
        modalBg.innerHTML = '';
    }, 200);
    document.removeEventListener('keydown', escListener);
}

function escListener(e) {
    if (e.key === 'Escape') closeModal();
}

async function renderRoster() {
    const data = await fetchRoster();
    if (!data) return;
    rosterData = data;
    const rosterDiv = document.getElementById('roster');
    rosterDiv.innerHTML = data.map((div, idx) => createDivisionCard(div, idx)).join('');
    Array.from(document.getElementsByClassName('division-card')).forEach(card => {
        card.onclick = function () {
            const idx = this.getAttribute('data-idx');
            showModal(rosterData[idx]);
        };
        card.onkeydown = function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const idx = this.getAttribute('data-idx');
                showModal(rosterData[idx]);
            }
        };
    });
}

function renderDivisionExpanders() {
    const container = document.getElementById('division-expanders');
    if (!window.rosterData || !Array.isArray(window.rosterData)) {
        container.innerHTML = '<div style="color:#dbab10;">Loading division info...</div>';
        return;
    }
    container.innerHTML = window.rosterData.map((div, idx) => `
        <div class="division-expander" tabindex="0" data-idx="${idx}">
            <div class="expander-title">
                ${div.patch_logo ? `<img src="${div.patch_logo}" alt="${div.name} Patch" style="height:100px;width:auto;vertical-align:middle;margin-right:0.7rem;border-radius:6px;border:2px solid #dbab10;box-shadow:0 2px 8px #dbab1044;">` : ''}
                <div style="margin-top: 3px;">
                    ${div.name} <span style="font-size:0.9rem;color:#aaa;"> (${div.tag})</span><br>
                    <span style="font-size:0.95rem;color:#aaa;"><br>Deployment Focus<br><span style="color:#fff; font-weight:normal;font-style:italic;">${div.deployment.focus ? div.deployment.focus : 'Not specified'}</span></span>
                </div>
            </div>
            <div class="expander-content" style="color: #ffffff;">${div.about ? div.about : 'No description available.'}</div>
        </div>
    `).join('');
    Array.from(document.getElementsByClassName('division-expander')).forEach(expander => {
        expander.onclick = function () {
            this.classList.toggle('active');
        };
        expander.onkeydown = function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.classList.toggle('active');
            }
        };
    });
}

async function fetchWarReportWithPlanets() {
    const reportDiv = document.getElementById('war-report');
    const planetsDiv = document.getElementById('active-planets');
    if (!window._lastWarReportRelevant) {
        reportDiv.innerHTML = '<div style="color:#dbab10;">Analyzing battlefronts...</div>';
        planetsDiv.innerHTML = '';
    }
    try {
        const res = await fetch('https://helldiverstrainingmanual.com/api/v1/war/campaign');
        if (!res.ok) throw new Error('Failed to fetch campaign data');
        const planetsRaw = await res.json();
        const planets = Object.values(planetsRaw);
        function getRelevantPlanetFields(planetsArr) {
            return (planetsArr || []).map(p => ({
                name: p.name,
                health: p.health,
                maxHealth: p.maxHealth,
                defense: p.defense,
                faction: p.faction,
                biome: p.biome ? p.biome.description : ''
            }));
        }
        const newRelevant = getRelevantPlanetFields(planets);
        const lastRelevant = window._lastWarReportRelevant || [];
        let changed = false;
        if (newRelevant.length !== lastRelevant.length) {
            changed = true;
        } else {
            for (let i = 0; i < newRelevant.length; i++) {
                const a = newRelevant[i], b = lastRelevant[i];
                if (!b || a.name !== b.name || a.health !== b.health || a.maxHealth !== b.maxHealth || a.defense !== b.defense || a.faction !== b.faction || a.biome !== b.biome) {
                    changed = true;
                    break;
                }
            }
        }
        if (changed) {
            window._lastWarReportRelevant = newRelevant;
            const fronts = {
                Automatons: [],
                Terminids: [],
                Illuminates: []
            };
            planets.forEach(p => {
                const faction = p.faction ? p.faction.toLowerCase() : '';
                if (faction.includes('automatons')) fronts.Automatons.push(p);
                else if (faction.includes('terminids')) fronts.Terminids.push(p);
                else if (faction.includes('illuminates')) fronts.Illuminates.push(p);
            });
            function recommend(frontArr) {
                return frontArr
                    .filter(p => typeof p.health === 'number' && typeof p.maxHealth === 'number')
                    .map(p => ({
                        ...p,
                        percentage: p.maxHealth > 0 ? (p.health / p.maxHealth) * 100 : 0,
                        completion: p.maxHealth > 0 ? (100 - ((p.health / p.maxHealth) * 100)) : 0
                    }))
                    .sort((a, b) => {
                        if (a.planetIndex !== undefined && b.planetIndex !== undefined) {
                            if (a.planetIndex !== b.planetIndex) {
                                return a.planetIndex - b.planetIndex;
                            }
                        }
                        return b.completion - a.completion;
                    })
                    .slice(0, 2);
            }
            const recs = {
                Automatons: recommend(fronts.Automatons),
                Terminids: recommend(fronts.Terminids),
                Illuminates: recommend(fronts.Illuminates),
            };
            const roster = await ensureRosterData();
            const companies = {
                Automatons: getDivisionCompanies('1ST', roster),
                Terminids: getDivisionCompanies('2ND', roster),
                Illuminates: getDivisionCompanies('3RD', roster),
            };
            function assignCompaniesToPlanets(companiesArr, planetsArr) {
                let sorted = (companiesArr || []).slice().sort((a, b) => {
                    const aCount = countNonVacantMembers(a);
                    const bCount = countNonVacantMembers(b);
                    if (aCount === 0 && bCount === 0) {
                        return a.name.localeCompare(b.name);
                    }
                    return bCount - aCount || a.name.localeCompare(b.name);
                });
                return planetsArr.map((planet, i) => {
                    const company = sorted[i % sorted.length];
                    return { planet, company };
                });
            }
            const assignments = {
                Automatons: assignCompaniesToPlanets(companies.Automatons, recs.Automatons),
                Terminids: assignCompaniesToPlanets(companies.Terminids, recs.Terminids),
                Illuminates: assignCompaniesToPlanets(companies.Illuminates, recs.Illuminates),
            };

            let reportHtml = `<div style='font-size:1.1rem;margin-bottom:2rem;'>AI Deployment Recommendations</div><div class='campaign-grid'>`;
            ['Automatons', 'Terminids', 'Illuminates'].forEach(faction => {
                reportHtml += `<div class='planet-card ${faction.toLowerCase()}'>`;
                reportHtml += `<div class='planet-header'>${faction} Front</div><div style='margin-bottom:0.5rem;'>Recommended Planets & Companies:</div>`;
                assignments[faction].forEach(({ planet, company }) => {
                    const cardId = `report-${faction}-${planet.name.replace(/\s+/g, '_')}`;
                    let existing = document.getElementById(cardId);
                    let cardHtml = `<div id='${cardId}' style='margin-top:2rem;'>`;
                    cardHtml += `<hr style='border-top: 1px solid #eee;'>`;
                    cardHtml += `<br><b>${planet.name}</b><br><span style='color:#dbab10;'>(Completion: ${planet.completion.toFixed(1)}%)</span>`;
                    let barColor = '#fe6d72';
                    if (planet.completion >= 75) barColor = '#00db4a';
                    else if (planet.completion >= 25) barColor = '#ffc100';
                    else if (planet.completion < 25) barColor = '#fe6d72';
                    cardHtml += `<div style='width:100%;height:18px;background:#313131;border-radius:8px;margin:8px 0 8px 0;box-shadow:0 2px 8px #0002;'><div style='height:100%;width:${planet.completion}%;background:${barColor};border-radius:8px;transition:width 0.5s;'></div></div>`;
                    cardHtml += `<b>Health:</b> <i style="color:#aaa;">${planet.health.toLocaleString()}</i> / <i style="color:#aaa;">${planet.maxHealth.toLocaleString()}</i><br>`;
                    cardHtml += `<b>Biome:</b> ${planet.biome ? planet.biome.description : 'Unknown'}<br><br>`;
                    cardHtml += `<span style='color:${faction === 'Automatons' ? '#00bfff' : faction === 'Terminids' ? '#ff9800' : '#b366ff'};'>Recommended Company:<br><span style='color:#aaa;'>${company ? company.name : 'N/A'}</span></span>`;
                    cardHtml += `</div>`;
                    reportHtml += cardHtml;
                });
                reportHtml += `</div>`;
            });
            reportHtml += `</div><div style='margin-top:2rem;font-size:0.98rem;color:#dbab10;'><b>Advisory:</b><br><span style="color: #ffffff;">Planet recommendations are selected by prioritizing those closest to Super Earth (lowest planetIndex) and, in case of ties, by highest completion percentage.<br><br>Company assignments are based on current complement (non-vacant members), with alphabetical fallback. These recommendations are advisory only; actual deployments may vary based on strategic needs and real-time developments.</span></div>`;
            reportDiv.innerHTML = reportHtml;
            let sortedPlanets = planets.filter(p => typeof p.planetIndex === 'number').sort((a, b) => a.planetIndex - b.planetIndex);
            let activeHtml = `<div style='font-size:1.1rem;margin-bottom:2rem;margin-top:2rem;'>Top 12 Active Planets</div><div class='campaign-grid'>`;
            sortedPlanets.slice(0, 12).forEach(p => {
                const factionClass = getFactionClass(p.faction);
                const cardId = `active-${p.name.replace(/\s+/g, '_')}`;
                let cardHtml = `<div id='${cardId}' class='planet-card ${factionClass}'>`;
                cardHtml += `<div class='planet-header'>${p.name}</div>`;
                cardHtml += `Faction: <span>${p.faction}</span><br>`;
                cardHtml += `Health: ${p.health.toLocaleString()} / ${p.maxHealth.toLocaleString()} (${p.percentage ? p.percentage.toFixed(1) : 0}%)<br>`;
                cardHtml += `Defense: ${p.defense ? 'Yes' : 'No'}<br><br>`;
                cardHtml += `Biome: ${p.biome ? p.biome.description : 'Unknown'}`;
                cardHtml += `</div>`;
                activeHtml += cardHtml;
            });
            activeHtml += `</div>`;
            planetsDiv.innerHTML = activeHtml;
        }
    } catch (e) {
        reportDiv.innerHTML = `<div style='color:red;'>Error loading war report data:<br>${e.message}</div>`;
        planetsDiv.innerHTML = '';
    }
}

const pageHome = document.getElementById('page-home');
const pageRoster = document.getElementById('page-roster');
const pageReport = document.getElementById('page-report');
const pageJoin = document.getElementById('page-join');

function showPage(page) {
    pageHome.style.display = 'none';
    pageRoster.style.display = 'none';
    pageReport.style.display = 'none';
    pageJoin.style.display = 'none';
    if (page === 'home') {
        pageHome.style.display = '';
        if (!window.rosterData || !Array.isArray(window.rosterData) || window.rosterData.length === 0) {
            ensureRosterData().then(() => {
                renderDivisionExpanders();
            });
        } else {
            renderDivisionExpanders();
        }
    } else if (page === 'roster') {
        pageRoster.style.display = '';
    } else if (page === 'report') {
        pageReport.style.display = '';
        fetchWarReportWithPlanets();
    } else if (page === 'join') {
        pageJoin.style.display = '';
    } else {
        pageHome.style.display = '';
        renderDivisionExpanders();
    }
}

function handleHash() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'roster') {
        showPage('roster');
    } else if (hash === 'report') {
        showPage('report');
    } else if (hash === 'join') {
        showPage('join');
    } else {
        showPage('home');
    }
}
window.addEventListener('hashchange', handleHash);
handleHash();

renderRoster();

setInterval(() => {
    if (document.getElementById('page-roster').style.display !== 'none') {
        renderRoster();
    }
    if (document.getElementById('page-report').style.display !== 'none') {
        fetchWarReportWithPlanets();
    }
    if (document.getElementById('page-home').style.display !== 'none') {
        ensureRosterData().then(() => {
            renderDivisionExpanders();
        });
    }
}, 5000);