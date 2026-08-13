/* =========================================================
   TBS VISITOR MANAGEMENT SYSTEM
========================================================= */


/* =========================================================
   SAMPLE VISITOR DATA
========================================================= */

let visitors = JSON.parse(
    localStorage.getItem("tbsVisitors")
) || [

    {
        id: 1,
        name: "John Doe",
        department: "Engineering",
        phone: "0771234567",
        checkIn: "09:05 AM",
        checkOut: "",
        status: "inside",
        late: false
    },

    {
        id: 2,
        name: "Jane Smith",
        department: "Marketing",
        phone: "0772345678",
        checkIn: "09:12 AM",
        checkOut: "",
        status: "inside",
        late: false
    },

    {
        id: 3,
        name: "Bob Johnson",
        department: "Finance",
        phone: "0773456789",
        checkIn: "08:58 AM",
        checkOut: "11:35 AM",
        status: "out",
        late: false
    }

];


/* =========================================================
   ELEMENTS
========================================================= */

const tableBody =
    document.getElementById("visitorTableBody");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchVisitors");

const statusFilter =
    document.getElementById("statusFilter");

const visitorForm =
    document.getElementById("visitorForm");

const clearButton =
    document.getElementById("clearVisitors");

const downloadButton =
    document.getElementById("downloadReport");


/* =========================================================
   SAVE DATA
========================================================= */

function saveVisitors() {

    localStorage.setItem(
        "tbsVisitors",
        JSON.stringify(visitors)
    );
}


/* =========================================================
   FORMAT TIME
========================================================= */

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderVisitors() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();

    const filter =
        statusFilter.value;


    const filteredVisitors =
        visitors.filter(visitor => {

            const matchesSearch =
                visitor.name
                    .toLowerCase()
                    .includes(searchTerm) ||

                visitor.department
                    .toLowerCase()
                    .includes(searchTerm) ||

                visitor.phone
                    .toLowerCase()
                    .includes(searchTerm);


            const matchesFilter =
                filter === "all" ||
                visitor.status === filter;


            return matchesSearch && matchesFilter;

        });


    tableBody.innerHTML = "";


    if (filteredVisitors.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";


        filteredVisitors.forEach(visitor => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="visitor-name">

                        <div class="visitor-avatar">
                            ${getInitials(visitor.name)}
                        </div>

                        <strong>
                            ${escapeHTML(visitor.name)}
                        </strong>

                    </div>

                </td>


                <td>
                    ${escapeHTML(visitor.department)}
                </td>


                <td>
                    ${visitor.checkIn}
                </td>


                <td>
                    ${
                        visitor.checkOut
                        ? visitor.checkOut
                        : '<span class="checked-out-label">—</span>'
                    }
                </td>


                <td>

                    ${
                        visitor.status === "inside"

                        ?

                        `
                        <span class="status status-inside">
                            Checked In
                        </span>
                        `

                        :

                        `
                        <span class="status status-out">
                            Checked Out
                        </span>
                        `
                    }

                </td>


                <td>

                    ${
                        visitor.status === "inside"

                        ?

                        `
                        <button
                            class="checkout-btn"
                            onclick="checkOutVisitor(${visitor.id})"
                        >
                            Check Out
                        </button>
                        `

                        :

                        `
                        <span class="checked-out-label">
                            Completed
                        </span>
                        `
                    }

                </td>

            `;


            tableBody.appendChild(row);

        });

    }


    updateStatistics();
}


/* =========================================================
   CHECK OUT VISITOR
========================================================= */

function checkOutVisitor(id) {

    const visitor =
        visitors.find(
            visitor => visitor.id === id
        );


    if (!visitor) {
        return;
    }


    visitor.status = "out";

    visitor.checkOut =
        getCurrentTime();


    saveVisitors();

    renderVisitors();


    showNotification(
        `${visitor.name} has been checked out.`
    );
}


/* =========================================================
   ADD NEW VISITOR
========================================================= */

visitorForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            document
                .getElementById("visitorName")
                .value
                .trim();


        const department =
            document
                .getElementById("visitorDepartment")
                .value
                .trim();


        const phone =
            document
                .getElementById("visitorPhone")
                .value
                .trim();


        if (!name || !department) {

            showNotification(
                "Please enter the visitor name and department."
            );

            return;
        }


        const newVisitor = {

            id:
                Date.now(),

            name:
                name,

            department:
                department,

            phone:
                phone || "Not provided",

            checkIn:
                getCurrentTime(),

            checkOut:
                "",

            status:
                "inside",

            late:
                false
        };


        visitors.unshift(newVisitor);


        saveVisitors();

        renderVisitors();


        visitorForm.reset();


        showNotification(
            `${name} has been checked in successfully.`
        );


        document
            .getElementById("visitors")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    renderVisitors
);


/* =========================================================
   FILTER
========================================================= */

statusFilter.addEventListener(
    "change",
    renderVisitors
);


/* =========================================================
   CLEAR ALL RECORDS
========================================================= */

clearButton.addEventListener(
    "click",
    function() {

        if (visitors.length === 0) {

            showNotification(
                "There are no visitor records to clear."
            );

            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to clear all visitor records?"
            );


        if (!confirmed) {
            return;
        }


        visitors = [];


        saveVisitors();

        renderVisitors();


        showNotification(
            "All visitor records have been cleared."
        );

    }
);


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        visitors.length;


    const checkedIn =
        visitors.filter(
            visitor =>
                visitor.status === "inside"
        ).length;


    const checkedOut =
        visitors.filter(
            visitor =>
                visitor.status === "out"
        ).length;


    const late =
        visitors.filter(
            visitor =>
                visitor.late === true
        ).length;


    document.getElementById(
        "totalVisitors"
    ).textContent = total;


    document.getElementById(
        "totalCheckedIn"
    ).textContent = checkedIn;


    document.getElementById(
        "totalCheckedOut"
    ).textContent = checkedOut;


    document.getElementById(
        "lateCheckIns"
    ).textContent = late;


    document.getElementById(
        "summaryCheckedIn"
    ).textContent = checkedIn;


    document.getElementById(
        "summaryLate"
    ).textContent = late;
}


/* =========================================================
   CURRENT DATE
========================================================= */

function updateDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    const now = new Date();


    dateElement.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
}


updateDate();


/* =========================================================
   DOWNLOAD CSV REPORT
========================================================= */

downloadButton.addEventListener(
    "click",
    function() {

        if (visitors.length === 0) {

            showNotification(
                "There are no records to download."
            );

            return;
        }


        let csv =
            "Name,Department,Phone,Check-in Time,Check-out Time,Status\n";


        visitors.forEach(visitor => {

            csv +=
                `"${visitor.name}",` +
                `"${visitor.department}",` +
                `"${visitor.phone}",` +
                `"${visitor.checkIn}",` +
                `"${visitor.checkOut || ""}",` +
                `"${visitor.status === "inside" ? "Checked In" : "Checked Out"}"\n`;

        });


        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "TBS-Visitor-Report.csv";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);


        showNotification(
            "Visitor report downloaded."
        );

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".nav-link")
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                this.classList.add(
                    "active"
                );

            }
        );

    });


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(message) {

    const existing =
        document.querySelector(
            ".notification"
        );


    if (existing) {
        existing.remove();
    }


    const notification =
        document.createElement("div");


    notification.className =
        "notification";


    notification.textContent =
        message;


    document.body.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.classList.add(
                "show"
            );

        },
        10
    );


    setTimeout(
        () => {

            notification.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    notification.remove();

                },
                300
            );

        },
        3000
    );
}


/* =========================================================
   SECURITY — ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   INITIAL LOAD
========================================================= */

renderVisitors();
updateStatistics();


/* =========================================================
   NOTIFICATION CSS
   Injected by JavaScript
========================================================= */

const notificationStyle =
    document.createElement("style");


notificationStyle.textContent = `

    .notification {

        position: fixed;

        right: 25px;
        bottom: 25px;

        max-width: 320px;

        padding: 14px 18px;

        border: 1px solid #b8d6f7;

        border-radius: 10px;

        background: #eaf4ff;

        color: #071a3d;

        box-shadow:
            0 10px 30px rgba(
                43,
                94,
                150,
                0.18
            );

        font-size: 12px;

        font-weight: 700;

        transform:
            translateY(20px);

        opacity: 0;

        z-index: 9999;

        transition:
            0.3s ease;
    }


    .notification.show {

        transform:
            translateY(0);

        opacity: 1;
    }

`;


document.head.appendChild(
    notificationStyle
);