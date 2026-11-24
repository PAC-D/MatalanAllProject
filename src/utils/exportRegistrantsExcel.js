function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function cell(value, type = 'String') {
  return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function worksheet(name, headers, rows) {
  const headerRow = `<Row>${headers.map((header) => cell(header)).join('')}</Row>`;
  const dataRows = rows.map((row) => (
    `<Row>${row.map((value) => cell(value, typeof value === 'number' ? 'Number' : 'String')).join('')}</Row>`
  )).join('');

  return `
    <Worksheet ss:Name="${escapeXml(name)}">
      <Table>${headerRow}${dataRows}</Table>
      <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
        <FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane>
      </WorksheetOptions>
    </Worksheet>`;
}

export function downloadRegistrantsExcel(registrants) {
  if (!registrants.length) return;

  const registrationHeaders = [
    'Registration ID', 'Country', 'Supplier Name', 'Supplier End Packaging Champion',
    'Factory Name', 'Factory End Packaging Champion', 'Jigs Quantity',
    'Distribution Supplier Name', 'Delivery Address', 'Attention Name', 'Phone',
    'Email', 'LMS Assignee Count', 'Submitted At', 'Status',
  ];
  const registrationRows = registrants.map((registrant) => [
    registrant.id,
    registrant.country,
    registrant.supplierName,
    registrant.supplierChampion,
    registrant.factoryName,
    registrant.factoryChampion,
    Number(registrant.jigsQuantity || 0),
    registrant.distributionSupplierName,
    registrant.detailsAddress,
    registrant.attentionName,
    registrant.contactPhone,
    registrant.contactEmail,
    registrant.assignees?.length || 0,
    registrant.submittedAt,
    registrant.status,
  ]);

  const assigneeHeaders = [
    'Registration ID', 'Country', 'Supplier Name', 'Factory Name', 'Assignee Number',
    'Assignee Name', 'Designation', 'Email Address',
  ];
  const assigneeRows = registrants.flatMap((registrant) => (
    (registrant.assignees || []).map((assignee, index) => [
      registrant.id,
      registrant.country,
      registrant.supplierName,
      registrant.factoryName,
      index + 1,
      assignee.name,
      assignee.designation,
      assignee.email,
    ])
  ));

  const workbook = `<?xml version="1.0"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
      <Styles>
        <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/></Style>
      </Styles>
      ${worksheet('Registrations', registrationHeaders, registrationRows)}
      ${worksheet('LMS Assignees', assigneeHeaders, assigneeRows)}
    </Workbook>`;

  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `matalan-registrations-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
