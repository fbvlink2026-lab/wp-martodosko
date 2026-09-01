package com.martodosko.wp;
import android.app.ProgressDialog;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
public class MainActivity extends AppCompatActivity {
    WebView webView;
    ProgressDialog loading;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.webView);
        webView.getSettings().setJavaScriptEnabled(true);
        loading = new ProgressDialog(this);
        loading.setMessage("Naglo-load ang WordPress...");
        loading.setCancelable(false);
        loading.show();
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) { if (loading.isShowing()) loading.dismiss(); }
            @Override
            public void onReceivedError(WebView view, int e, String desc, String url) {
                view.loadDataWithBaseURL(null,
                    "<html><body style='text-align:center;padding-top:100px;color:#666;font-family:sans-serif;'>" +
                    "<h3>🔌 Hindi Makakonekta</h3><p>Patakbuhin muna ang WordPress sa Termux gamit ang wpgo</p>" +
                    "</body></html>", "text/html", "UTF-8", null);
                if (loading.isShowing()) loading.dismiss();
            }
        });
        webView.loadUrl("http://localhost:8080");
    }
    @Override
    public void onBackPressed() { if (webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
}
