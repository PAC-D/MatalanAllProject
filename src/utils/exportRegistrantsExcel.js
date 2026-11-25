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

  const maximumFactories = Math.max(...registrants.map((registrant) => registrant.factories?.length || 0));
  const maximumLmsUsers = Math.max(...registrants.map((registrant) => registrant.assignees?.length || 0));
  const maximumTpsUsers = Math.max(...registrants.map((registrant) => registrant.tpsUsers?.length || 0));
  const factoryDetailHeaders = Array.from({ length: maximumFactories }, (_, index) => [
    `Factory ${index + 1} Name`,
    `Factory ${index + 1} Country`,
    `Factory ${index + 1} Champion Name`,
    `Factory ${index + 1} Champion Designation`,
    `Factory ${index + 1} Champion Email`,
  ]).flat();
  const userDetailHeaders = (prefix, count) => Array.from({ length: count }, (_, index) => [
    `${prefix} ${index + 1} Person Name`,
    `${prefix} ${index + 1} Organisation`,
    `${prefix} ${index + 1} Supplier / Factory Pair`,
    `${prefix} ${index + 1} Designation`,
    `${prefix} ${index + 1} Email`,
  ]).flat();
  const registrationHeaders = [
    'Registration ID', 'Supplier Country', 'Supplier Name', 'Supplier Champion Name',
    'Supplier Champion Designation', 'Supplier Champion Email', 'Factory Count',
    ...factoryDetailHeaders,
    'LMS User Count', ...userDetailHeaders('LMS User', maximumLmsUsers),
    'TPS User Count', ...userDetailHeaders('TPS User', maximumTpsUsers),
    'Jigs Quantity',
    'Distribution Supplier Name', 'Delivery Address', 'Attention Name', 'Phone',
    'Email', 'Submitted At', 'Status',
  ];
  const expandFactories = (factories) => Array.from({ length: maximumFactories }, (_, index) => {
    const factory = factories?.[index];
    return [
      factory?.name || '',
      factory?.country || '',
      factory?.champion || '',
      factory?.designation || '',
      factory?.email || '',
    ];
  }).flat();
  const expandUsers = (users, maximumUsers) => Array.from({ length: maximumUsers }, (_, index) => {
    const user = users?.[index];
    return [
      user?.name || '',
      user?.organization || '',
      user?.organizationPair || '',
      user?.designation || '',
      user?.email || '',
    ];
  }).flat();
  const registrationRows = registrants.map((registrant) => [
    registrant.id,
    registrant.country,
    registrant.supplierName,
    registrant.supplierChampion,
    registrant.supplierChampionDesignation,
    registrant.supplierChampionEmail,
    registrant.factories?.length || 0,
    ...expandFactories(registrant.factories),
    registrant.assignees?.length || 0,
    ...expandUsers(registrant.assignees, maximumLmsUsers),
    registrant.tpsUsers?.length || 0,
    ...expandUsers(registrant.tpsUsers, maximumTpsUsers),
    Number(registrant.jigsQuantity || 0),
    registrant.distributionSupplierName,
    registrant.detailsAddress,
    registrant.attentionName,
    registrant.contactPhone,
    registrant.contactEmail,
    registrant.submittedAt,
    registrant.status,
  ]);

  const factoryHeaders = [
    'Registration ID', 'Supplier Country', 'Supplier Name', 'Factory Number',
    'Factory Name', 'Factory Country', 'Champion Name', 'Designation', 'Email Address',
  ];
  const factoryRows = registrants.flatMap((registrant) => (
    (registrant.factories || []).map((factory, index) => [
      registrant.id,
      registrant.country,
      registrant.supplierName,
      index + 1,
      factory.name,
      factory.country,
      factory.champion,
      factory.designation,
      factory.email,
    ])
  ));

  const userHeaders = [
    'Registration ID', 'Supplier Country', 'Supplier Name', 'User Number',
    'Person Name', 'Organisation', 'Supplier / Factory Pair', 'Designation', 'Email Address',
  ];
  const userRows = (key) => registrants.flatMap((registrant) => (
    (registrant[key] || []).map((user, index) => [
      registrant.id,
      registrant.country,
      registrant.supplierName,
      index + 1,
      user.name,
      user.organization,
      user.organizationPair,
      user.designation,
      user.email,
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
      ${worksheet('Factory Champions', factoryHeaders, factoryRows)}
      ${worksheet('LMS Users', userHeaders, userRows('assignees'))}
      ${worksheet('TPS Users', userHeaders, userRows('tpsUsers'))}
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
