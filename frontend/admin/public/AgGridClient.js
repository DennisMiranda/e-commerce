document.addEventListener("DOMContentLoaded", function () {
  const loadTable = async () => {
    // Grid API: Access to Grid API methods
    let gridApi;

    try {
      const res = await fetch("http://localhost:3000/products", {
        headers: {
          "x-token": window.sessionStorage.getItem("token"),
        },
      });
      const products = await res.json();

      // Grid Options: Contains all of the grid configurations
      const gridOptions = {
        rowData: products,
        // Columns to be displayed
        columnDefs: [
          { field: "id", headerName: "ID", filter: "agNumberColumnFilter" },
          {
            field: "category",
            headerName: "Categoría",
            filter: "agTextColumnFilter",
          },
          { field: "name", headerName: "Nombre", filter: "agTextColumnFilter" },
          { field: "brand", headerName: "Marca", filter: "agTextColumnFilter" },
          {
            field: "description",
            headerName: "Descripción",
            filter: "agTextColumnFilter",
          },
          {
            field: "price",
            headerName: "Precio",
            filter: "agNumberColumnFilter",
          },
          {
            field: "stock",
            headerName: "Cantidad",
            filter: "agNumberColumnFilter",
          },
          {
            field: "status",
            headerName: "Estatus",
            filter: "agNumberColumnFilter",
          },
          { field: "image", headerName: "Imagen", minWidth: 100 },
          {
            field: "actions",
            headerName: "Editar",
            pinned: "right",
            cellRenderer: (params) => {
              // Crear el contenedor para los botones
              const container = document.createElement("div");
              container.className = "flex items-center h-full gap-3"; // Contenedor para los botones

              // Crear botón de edición
              const editButton = document.createElement("button");
              editButton.className =
                "edit-btn min-w-10 text-center bg-aside-bg text-text-primary px-3 py-2 rounded-md hover:bg-text-primary hover:text-white transition";
              editButton.dataset.id = params.data.id;
              editButton.innerHTML = `<img src="/icons/edit.svg" alt="Edit" width="18" height="18" />`;
              editButton.addEventListener("click", () => {
                window.openEditModal(params.data); // Pasamos params.data al modal de edición
              });

              // Agregar el boton al contenedor
              container.appendChild(editButton);
              return container; // Devuelve el contenedor con ambos botones
            },
          },
        ],
        defaultColDef: {
          flex: 1,
        },
        autoSizeStrategy: {
          type: "fitCellContents",
        },
        theme:
          agGrid.themeQuartz?.withParams?.({ wrapperBorder: false }) ||
          undefined,
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 20, 50, 100],
        localeText: window.localeText,
      };

      // Crear Tabla en  #myGrid div, usando grid options
      const container = document.querySelector("#myGrid");
      if (container) {
        gridApi = agGrid.createGrid(container, gridOptions);
        window.gridApi = gridApi;
      }
    } catch (error) {
      console.log(error);
    }
  };

  loadTable();
  // Detectar y reemplazar "Page Size" dinámicamente
  const observer = new MutationObserver(() => {
    const labels = document.querySelectorAll(".ag-paging-page-size .ag-label");
    labels.forEach((label) => {
      if (label.textContent.trim() === "Page Size:") {
        label.textContent = "Mostrar:";
        observer.disconnect(); // dejamos de observar una vez traducido
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

// Función para asociar el evento al boton de edición
function attachEditButtonListeners() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;
      const modal = document.getElementById("modal-form");
      const form = modal.querySelector("form");

      try {
        const res = await fetch(`http://localhost:3000/products/${productId}`);
        const product = await res.json();

        // Asumimos que el backend devuelve un solo objeto (no en un array)
        form["product-name"].value = product.name;
        form["product-brand"].value = product.brand;
        form["product-description"].value = product.description;
        form["product-price"].value = product.price;
        form["product-stock"].value = product.stock;
        form["select-category"].value = product.categories_id;

        // Ocultar campo de estatus si existe (solo en modo agregar)
        const statusField = form.querySelector('[name="product-status"]');
        if (statusField) {
          statusField.closest(".mb-4").style.display = "none";
        }

        modal.dataset.mode = "edit";
        modal.dataset.id = productId;
        modal.style.display = "block";
      } catch (err) {
        console.error("Error al cargar el producto:", err);
        alert("No se pudo cargar el producto para editar.");
      }
    });
  });
}
