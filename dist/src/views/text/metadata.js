import { post } from "../../api.js";
import { textTypes, aowRoles, showModalError, debounce, isEmpty, } from "../../utils.js";
const listenEditAowPersonDetailFunc = (t) => {
    const val = t.textContent || "";
    const savedVal = t.dataset.value;
    if (val != savedVal) {
        const item = t.dataset.item;
        const aowPersonId = t.closest(".aow-person-item")?.dataset.aowpersonid;
        post(`/aows/update_aow_person_detail`, {
            aow_person_id: aowPersonId,
            value: val,
            item: item,
        }).then((data) => {
            if (!data || !data.ok) {
                alert("Some error happened, sorry!");
            }
            else {
                t.dataset.value = val;
            }
        });
    }
};
export const listeners = {
    click: [
        {
            selector: ".add-text-type",
            callback: (t) => {
                t.nextSibling?.classList.remove("d-none");
            },
        },
        {
            selector: ".add-aow-text-type",
            callback: (t) => {
                const cont = t.closest(".text-type-select-div");
                const tt = cont.querySelector(".text-type-select")?.value;
                const status = cont.querySelector(".text-status-select")?.value;
                const aowN = t.closest(".metadata-card")?.dataset.aown;
                const textId = t.closest(".metadata-card")?.dataset.textid;
                post(`/aows/add_aow_text_type`, {
                    text_type: tt,
                    status: status,
                    aow_n: aowN,
                    text_id: textId,
                }).then((data) => {
                    if (data && data.ok) {
                        t.closest(".card-content")
                            .querySelector(".text-type-items")
                            ?.insertAdjacentHTML("beforeend", formatAowTt(data.result, { user: true }));
                        t.closest(".card-content")
                            .querySelector(".text-type-select-div")
                            ?.classList.add("d-none");
                    }
                });
            },
        },
        {
            selector: ".delete-text-type",
            callback: (t) => {
                const val = t.dataset.aowttid;
                post(`/aows/delete_aow_text_type`, { aow_tt_id: val }).then((data) => {
                    if (data && data.ok) {
                        t.closest(".text-type-item")?.remove();
                    }
                });
            },
        },
        {
            selector: ".add-aow-person",
            callback: (t) => {
                const aowN = t.closest(".metadata-card")?.dataset.aown;
                const textId = t.closest(".metadata-card")?.dataset.textid;
                post(`/aows/add_aow_person`, { aow_n: aowN, text_id: textId }).then((data) => {
                    if (data && data.ok) {
                        t.closest(".card-content")
                            ?.querySelector(".aow-people-items")
                            ?.insertAdjacentHTML("beforeend", formatAowPerson(data.result, { user: true }));
                    }
                    else {
                        showModalError("An unknown error happened.");
                    }
                });
            },
        },
        {
            selector: ".delete-aow-person-confirm",
            callback: (t) => {
                const aowPersonID = t.closest("#delete-aow-person-modal")
                    ?.dataset.id;
                delete t.closest("#delete-aow-person-modal")?.dataset.id;
                post(`/aows/delete_aow_person`, { aow_person_id: aowPersonID }).then((data) => {
                    if (data && data.ok) {
                        $(`.aow-person-item[data-aowpersonid="${aowPersonID}"]`)?.remove();
                    }
                });
            },
        },
        {
            selector: ".delete-aow-person",
            callback: (t) => {
                const modal = $("#delete-aow-person-modal");
                modal.dataset.id =
                    t.closest(".aow-person-item")?.dataset.aowpersonid;
                modal?.classList.remove("d-none");
            },
        },
        {
            selector: ".edit-aow-person",
            callback: (t) => {
                const modal = $("#edit-aow-person-modal");
                modal.dataset.id =
                    t.closest(".aow-person-item")?.dataset.aowpersonid;
                modal.querySelector("#existing-person-id").innerHTML =
                    t.closest(".aow-person-item")?.dataset
                        .aowpersonpersonid || "";
                modal.classList.remove("d-none");
            },
        },
        {
            selector: ".update-person-id",
            callback: (t) => {
                const modal = $("#edit-aow-person-modal");
                const personId = $("#existing-person-id")?.textContent || "";
                const aowPersonId = modal?.dataset.id;
                delete t.closest("#edit-aow-person-modal").dataset.id;
                if (/^\+?(0|[1-9]\d*)$/.test(personId.trim())) {
                    post(`/aows/update_aow_person_id`, {
                        aow_person_id: aowPersonId,
                        person_id: personId,
                    }).then((data) => {
                        if (data && data.ok) {
                            updateAowPersonCard(data.result);
                        }
                        else {
                            alert("Invalid Person ID");
                        }
                    });
                }
                else {
                    alert("Invalid Person ID");
                }
            },
        },
        {
            selector: ".add-person-and-association",
            callback: (t) => {
                const modal = $("#edit-aow-person-modal");
                const tmId = $("#new-person-tmid")?.textContent;
                const personName = $("#new-person-name")?.textContent;
                const gender = $('input[name="new-gender"]:checked')?.value;
                const aowPersonId = modal?.dataset.id;
                delete t.closest("#edit-aow-person-modal")?.dataset.id;
                post(`/aows/add_person_and_association`, {
                    aow_person_id: aowPersonId,
                    person_name: personName,
                    tm_id: tmId,
                    gender: gender,
                }).then((data) => {
                    if (data && data.ok) {
                        updateAowPersonCard(data.result);
                    }
                    else {
                        alert("Some fields seem to be incorrect.");
                    }
                });
            },
        },
        {
            selector: ".edit-aow-person-certainty",
            callback: (t) => {
                const aowPersonId = t.closest(".aow-person-item")?.dataset.aowpersonid;
                const uncertain = t.dataset.uncertain;
                const newVal = 1 - +uncertain;
                post(`/aows/update_aow_person_uncertainty`, {
                    aow_person_id: aowPersonId,
                    uncertain: newVal,
                }).then((data) => {
                    if (data && data.ok) {
                        t.classList.remove("uncertainty-1", "uncertainty-0");
                        t.classList.add(`uncertainty-${newVal}`);
                        t.dataset.uncertain = `${newVal}`;
                    }
                });
            },
        },
    ],
    change: [
        {
            selector: ".aow-person-role-select",
            callback: (t) => {
                const aowPersonId = t.closest(".aow-person-item")?.dataset.aowpersonid;
                const newRole = t
                    .querySelector("option")
                    ?.closest("select")?.value;
                post(`/aows/update_aow_person_role`, {
                    aow_person_id: aowPersonId,
                    role: newRole,
                }).then((data) => {
                    if (!data || !data.ok) {
                        alert("Some error happened, sorry!");
                    }
                });
            },
        },
    ],
    input: [
        {
            selector: ".aow-person-editable-detail",
            callback: debounce(listenEditAowPersonDetailFunc),
        },
    ],
};
const updateAowPersonCard = (aowPerson) => {
    let aowPersonEl = $(`.aow-person-item[data-aowpersonid="${aowPerson.id}"`);
    if (aowPersonEl) {
        aowPersonEl.dataset.aowpersonpersonid = aowPerson.person_id;
        aowPersonEl.querySelector(".aow-personname").innerHTML = `<a href="/person/${aowPerson.person_id}">${aowPerson.name}</a>`;
        aowPersonEl.querySelector(".aow-person-tmid").innerHTML =
            aowPerson.tm_id;
        let gender = "?";
        if (aowPerson.gender == "1") {
            gender = "male";
        }
        else if (aowPerson.gender == "2") {
            gender = "female";
        }
        aowPersonEl.querySelector(".aow-person-gender").innerHTML =
            gender;
        aowPersonEl.querySelector(".aow-person-personid").innerHTML =
            aowPerson.person_id;
    }
    else {
        alert("Error");
    }
};
const formatAowPerson = (aowPerson, user) => {
    const ed = !isEmpty(user)
        ? ' class="noenter aow-person-editable-detail" contenteditable="true" '
        : "";
    const dlt = !isEmpty(user)
        ? '<span style="position:absolute; right:0; top:0;" class="delete-aow-person button button-del">×</span>'
        : "";
    const listenPersonEdit = !isEmpty(user)
        ? '<span class="button-plain button edit-aow-person">Edit</span>'
        : "";
    const certaintyEdit = !isEmpty(user) ? "edit-aow-person-certainty" : "";
    let gender = "?";
    if (aowPerson.gender == "1") {
        gender = "male";
    }
    else if (aowPerson.gender == "2") {
        gender = "female";
    }
    const role = !isEmpty(user)
        ? `<span class="select aow-person-role-select"><select class="aow-person-select">
            ${aowRoles()
            .map((t) => {
            return `<option ${t[0] == aowPerson.role ? `selected` : ""} value="${t[0]}">${t[1]}</option>`;
        })
            .join("")}
        </select></span>
        `
        : `${aowPerson.role.charAt(0).toUpperCase() + aowPerson.role.slice(1)}`;
    return `
        <div data-aowpersonpersonid="${aowPerson.person_id}" data-aowpersonid="${aowPerson.id}" class="aow-person-item" style="margin-bottom:20px">
            ${dlt}
            <p class="bold centered" style="font-size:11pt;">${role}: <span class="aow-personname"><a href="/person/${aowPerson.person_id}">${aowPerson.name}</a></span> <span data-uncertain="${aowPerson.uncertain || 0}" class="${certaintyEdit} badge-small uncertainty-${aowPerson.uncertain || 0}"></span> ${listenPersonEdit}</p>
            <p class="centered" style="margin-top:-10px;"><span class="badge-small">ID: <span class="aow-person-personid">${aowPerson.person_id}</span></span> <span class="badge-small">TM ID: <span class="aow-person-tmid">${aowPerson.tm_id || ""}</span></span> <span class="badge-small">Gender: <span class="aow-person-gender">${gender}</span></span></p>
                <table class="metadata">
                <tr>
                    <th>Domicile</th>
                    <th>Ethnic</th>
                    <th>Honorific</th>
                </tr>
                <tr>
                    <td data-value="${aowPerson.domicile || ""}" data-item="domicile" ${ed}>${aowPerson.domicile || ""}</td>
                    <td data-value="${aowPerson.ethnic || ""}" data-item="ethnic" ${ed}>${aowPerson.ethnic || ""}</td>
                    <td data-value="${aowPerson.honorific || ""}" data-item="honorific" ${ed}>${aowPerson.honorific || ""}</td>
                </tr>
                </table>
                <table class="metadata">
                <tr>
                    <th>Handwriting</th>
                    <th>Education</th>
                    <th>Occupation</th>
                </tr>
                <tr>
                    <td data-value="${aowPerson.handwriting || ""}" data-item="handwriting" ${ed}>${aowPerson.handwriting || ""}</td>
                    <td data-value="${aowPerson.education || ""}" data-item="education" ${ed}>${aowPerson.education || ""}</td>
                    <td data-value="${aowPerson.occupation || ""}" data-item="occupation" ${ed}>${aowPerson.occupation || ""}</td>
                </tr>
                </table>
        </div>
    `;
};
const formatAowTt = (aow_tt, user) => {
    let aowCodes = [aow_tt.hypercategory];
    if (aow_tt.category) {
        aowCodes.push(aow_tt.category);
    }
    if (aow_tt.subcategory) {
        aowCodes.push(aow_tt.subcategory);
    }
    const statusText = [
        "",
        '<span class="info">(Draft)</span>',
        '<span class="info">(Copy)</span>',
    ];
    let ttName = textTypes().find((el) => el[0] == aowCodes.join("-"));
    const status = aow_tt.status;
    if (ttName) {
        return `    
        <div style="font-variant:small-caps; font-weight:500; margin:3px 0" class="centered text-type-item"><span class="sym">📖</span> ${ttName[1]
            .replace(/\-/g, "")
            .trim()} ${statusText[status]} ${!isEmpty(user)
            ? `<span data-aowttid="${aow_tt.id}" class="delete-text-type button button-del">×</span>`
            : ``}</div>
    `;
    }
    return "";
};
const formatMetadata = (data, user, docId) => {
    let html = "";
    data.forEach((aow) => {
        html += `
        <div class="card metadata-card" data-textid="${docId}" data-aown="${aow.aow_n}" >
            <div class="card-header"><div class="card-title"><span style="font-size:2.5em; position:relative;top:4px;margin-right:4px"><span class="sym">✍</span></span> ${aow.hand}</div></div>
            <div class="card-content" style="margin-top:-10px;">
                <div class="centered" style="margin:10px 0 15px;">
                    <div class="text-type-items">
                        ${aow.text_types
            .map((aow_tt) => {
            return formatAowTt(aow_tt, user);
        })
            .join("") || ""}
                    </div>
                    ${!isEmpty(user)
            ? `
                        <span class="add-text-type button button-small">Add text type</span><div class="text-type-select-div d-none"><div class="select"><select class="text-type-select">
                        <option value="" selected></option>
                            ${textTypes()
                .map((t) => {
                return `<option value="${t[0]}">${t[1]}</option>`;
            })
                .join("")}
                        </select>
                        </div> <div class="select"><select class="text-status-select"><option value="0" selected">Normal</option><option value="1">Draft</option><option value="2">Copy</option></select></div> <span class="add-aow-text-type button button-green button-small">Add</span></div>
                    `
            : ``}
                </div>
                <div class="centered" style="margin:10px 0 15px;">
                    <div class="aow-people-items">
                        ${aow.people
            .map((aowPerson) => {
            return formatAowPerson(aowPerson, user);
        })
            .join("")}
                    </div>
                    ${!isEmpty(user)
            ? `
                        <span class="add-aow-person button button-small">New person association</span>
                    `
            : ``}
                </div>
            </div>
        </div>
        `;
    });
    html += `
    <div id="delete-aow-person-modal" class="d-none modal centered">
        <div class="modal-content">
            <div style="margin-bottom:10px;" class="semi-bold">Really delete this person association?</div>
            <span class="button button-red button-small delete-aow-person-confirm modal-save">Yes</span>
            <span class="button button-grey button-small modal-cancel">Cancel</span>
        </div>
    </div>
    <div id="edit-aow-person-modal" class="modal d-none">
        <div class="modal-content">
        <span class="modal-close"></span>
            <div style="display:grid; grid-template-columns: 1fr 1fr;">
                <div>
                    <h4>Person ID</h4>
                    <p class="editable noenter" id="existing-person-id" contenteditable="true"></p>
                </div>
                <div>
                    <h4>Add new person</h4>
                    <div class="semi-bold">Name</div>
                    <span style="width:200px" class="editable noenter" id="new-person-name" contenteditable="true"></span>
                    <div class="semi-bold">TM ID</div>
                    <p class="editable noenter" id="new-person-tmid" contenteditable="true"></p>
                    <div style="padding:10px 0;">
                        <input type="radio" id="new-male" name="new-gender" value="1">
                        <label for="new-male">Male</label>
                        <input type="radio" id="new-female" name="new-gender" value="2">
                        <label for="new-female">Female</label>
                        <input checked type="radio" id="new-unknown" name="new-gender" value="">
                        <label for="new-unknown">Unknown</label>
                    </div>
                </div>
                <div>
                    <span class="button button-small update-person-id modal-save">Save</span>
                </div>
                <div>
                    <span class="button button-small button-green add-person-and-association modal-save">Add</span>
                </div>
            </div>
        </div>
    </div>
  `;
    return html;
};
export default async (doc, user) => {
    return post(`/aows/`, { text_id: doc.id }).then((data) => {
        if (data && data.ok && data.result.length) {
            return formatMetadata(data.result, user, doc.id);
        }
        else {
            return '<p style="text-align:center;">No metadata.</p>';
        }
    });
};
