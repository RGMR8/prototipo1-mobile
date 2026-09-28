# Deuda técnica

| Tema | Por qué no ahora | Cuándo hacerlo |
|---|---|---|
| Registro de componentes (mapa en vez de cadena de `if`) | Con 7 tipos es manejable; cambia una convención del equipo | Al pasar de ~12 tipos, previa decisión con Martín |
| Tests (Jest) para parser, validación y acciones | Cambia el flujo de trabajo del equipo | Decisión con Martín |
| Rendimiento del Form (un context para todos los valores) | Formularios de 3-4 campos, sin impacto medible | Si aparece un formulario grande con lentitud |
| Historial del navegador en web (botón atrás) | Stack de navegación propio, la web es solo preview | Si la web deja de ser solo preview |
| Campos obligatorios duplicados en backend (pantalla + `guarda_registro`) | Endpoint de prueba sin base de datos | Con el primer formulario real (Aguaban) |
| Códigos HTTP y verbo HTTP en el router | Manejo de errores está excluido del #2 | Prototipo #4 |
| Ternarios en JSX vs. convención "solo if" | Pendiente confirmar con Martín si aplica al render | Revisión del #2 |