
# Regex Pattern Matching & Replacement Web App

This project is a **Django + React** web application that:
- ✅ Allows users to upload **CSV** or **Excel** files.
- ✅ Lets users input a **column name**, a **natural language pattern description**, and a **replacement value**.
- ✅ Uses a **Regex pattern** (generated dynamically) to match and replace content in the specified column.
- ✅ Displays both the **uploaded data** and the **processed output** in side-by-side tables.

---

##  **Setup Instructions**

###  1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

---

###  2️⃣ Backend Setup (Django)
```bash
# Navigate to backend directory
cd regex_app

# (Optional) Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

The **Django server** will run at `http://localhost:8000/`.

---

###  3️⃣ Frontend Setup (React)
```bash
# Navigate to frontend directory
cd regex-frontend

# Install dependencies
npm install

# Start the React app
npm start
```

The **React app** will run at `http://localhost:3000/`.

---

##  **Usage Instructions**
1️⃣ Open `http://localhost:3000/`.  
2️⃣ Upload a **CSV** or **Excel** file.  
3️⃣ Enter:
- **Column Name**: The exact name of the column (case-insensitive, space-insensitive).
- **Pattern Description**: Natural language input like `"Find emails"`or `"Replace phone numbers"`.
- **Replacement Value**: Text to replace the matched pattern (e.g., `"REDACTED"`, `"0000"`).

4️⃣ Click **Upload & Process**.  
5️⃣ View the **original data** on the left and the **processed data** on the right.

---

##  **Key Features**
- **Django Backend**: Handles file uploads, applies regex replacements, and returns the modified data.
- **React Frontend**: User-friendly interface with live data preview and processed output.
- **Regex Generation**: Converts natural language descriptions to regex patterns (e.g., emails, phone numbers, generic replacements).
- **Supports CSV & Excel Files**.
- **Error Handling**: Displays clear error messages for missing columns, invalid patterns, or unsupported file types.

---

##  **Project Structure**
```
regex_app/
├── api/
│   ├── migrations/
│   ├── __init__.py
│   ├── models.py
│   ├── views.py  # Main backend logic
│   └── urls.py
├── regex_app/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── manage.py

regex-frontend/
├── public/
├── src/
│   ├── App.js  # Main frontend logic
│   ├── styles.css  # Custom CSS for layout
│   └── index.js
├── package.json
```

---

##  **Additional Notes**
- **Column Matching**: The backend matches column names case-insensitively and ignores extra spaces.
- **Pattern Matching**: The system currently supports patterns like `email`, `phone/contact numbers`, `first name`, and a fallback for generic replacements.
- **CSV Encoding**: The backend handles common encodings like `utf-8`. Ensure your CSV uses standard formatting.
- **File Size**: For large files, performance may vary. Optional enhancements for chunked uploads and async processing can be added.

---


## 🙌 **Acknowledgements**
Thanks to all open-source contributors and tools used in this project:
- Django & Django REST Framework  
- React  
- Pandas  
- XLSX.js  
- Axios  
