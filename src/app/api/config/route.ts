import { NextRequest, NextResponse } from 'next/server';
import { getDriveConfig, saveDriveConfig } from '@/lib/storage';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '@/lib/googleDrive';

export async function GET() {
  try {
    const config = getDriveConfig();
    return NextResponse.json({
      success: true,
      config: {
        mode: config.mode,
        appsScriptUrl: config.appsScriptUrl ? '***' + config.appsScriptUrl.slice(-15) : '',
        hasAppsScriptUrl: !!config.appsScriptUrl,
        clientEmail: config.clientEmail || '',
        hasPrivateKey: !!config.privateKey,
        folderId: config.folderId || '',
      },
      templateScript: GOOGLE_APPS_SCRIPT_TEMPLATE,
    });
  } catch (error) {
    console.error('Error in GET /api/config:', error);
    return NextResponse.json({ success: false, error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, appsScriptUrl, clientEmail, privateKey, folderId } = body;

    const updated = saveDriveConfig({
      mode: mode || 'apps_script',
      ...(appsScriptUrl !== undefined && { appsScriptUrl }),
      ...(clientEmail !== undefined && { clientEmail }),
      ...(privateKey !== undefined && { privateKey }),
      ...(folderId !== undefined && { folderId }),
    });

    return NextResponse.json({
      success: true,
      message: 'Google Drive configuration saved!',
      mode: updated.mode,
      hasAppsScriptUrl: !!updated.appsScriptUrl,
    });
  } catch (error) {
    console.error('Error in POST /api/config:', error);
    return NextResponse.json({ success: false, error: 'Failed to save config' }, { status: 500 });
  }
}
