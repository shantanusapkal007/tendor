import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export async function GET() {
  try {
    const data = [
      ['Sr. No.', 'Art.-No.', 'Description', 'Gross Price', 'Discount %', 'Net Price'],
      [1, '4230.11630', 'Collet Chuck SK 30 / ER 16 x 070 H', 22163.00, '50%', 11082.00],
      [2, '4230.12030', 'Collet Chuck SK 30 / ER 20 x 070 H', 22850.00, '50%', 11425.00],
      [3, '4230.12540', 'Collet Chuck SK 30 / ER 25 x 080 H', 23400.00, '50%', 11700.00],
      [4, '4230.13250', 'Collet Chuck SK 30 / ER 32 x 100 H', 24650.00, '50%', 12325.00],
      [5, '1116.02000', 'Standard Collet ER 16 - d 2.0 mm', 3150.00, '50%', 1575.00],
      [6, '1116.03000', 'Standard Collet ER 16 - d 3.0 mm', 3150.00, '50%', 1575.00],
      [7, '1116.04000', 'Standard Collet ER 16 - d 4.0 mm', 3150.00, '50%', 1575.00],
      [8, '1120.06000', 'Standard Collet ER 20 - d 6.0 mm', 3480.00, '50%', 1740.00],
      [9, '1125.10000', 'Standard Collet ER 25 - d 10.0 mm', 3890.00, '50%', 1945.00],
      [10, '1132.16000', 'Standard Collet ER 32 - d 16.0 mm', 4420.00, '50%', 2210.00],
      [11, '3116.10000', 'Clamping Nut Hi-Q / ER 16', 2950.00, '50%', 1475.00],
      [12, '3125.10000', 'Clamping Nut Hi-Q / ER 25', 3600.00, '50%', 1800.00],
    ];

    const ws = xlsx.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 10 },
      { wch: 18 },
      { wch: 42 },
      { wch: 15 },
      { wch: 14 },
      { wch: 15 },
    ];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Products');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="sample-product-template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating sample template:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
