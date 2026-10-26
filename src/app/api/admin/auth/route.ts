import { NextRequest, NextResponse } from 'next/server';
import { getDriveConfig, saveDriveConfig } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, secretKey, currentSecret, newSecret } = body;
    const config = getDriveConfig();
    const actualSecret = config.adminSecret || 'admin123';

    if (action === 'verify') {
      if (!secretKey) {
        return NextResponse.json({ success: false, error: 'Secret Key is required' }, { status: 400 });
      }

      if (secretKey === actualSecret) {
        // Return a signed or hashed session token or success
        return NextResponse.json({
          success: true,
          message: 'Access granted!',
          token: Buffer.from(`admin_auth_${Date.now()}_${actualSecret}`).toString('base64'),
        });
      } else {
        return NextResponse.json({ success: false, error: 'Incorrect Secret Key! Access Denied.' }, { status: 401 });
      }
    }

    if (action === 'change') {
      if (!currentSecret || !newSecret) {
        return NextResponse.json({ success: false, error: 'Current and new secret keys are required.' }, { status: 400 });
      }

      if (currentSecret !== actualSecret) {
        return NextResponse.json({ success: false, error: 'Current secret key is incorrect.' }, { status: 401 });
      }

      if (newSecret.trim().length < 4) {
        return NextResponse.json({ success: false, error: 'New secret key must be at least 4 characters long.' }, { status: 400 });
      }

      saveDriveConfig({ adminSecret: newSecret.trim() });

      return NextResponse.json({
        success: true,
        message: 'Secret key updated successfully!',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in /api/admin/auth:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
