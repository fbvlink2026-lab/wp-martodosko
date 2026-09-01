package com.martodosko.wp;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        // ✅ Opsyon 1 — docs/wordpress mula sa GitHub Pages
        String baseUrl = "https://fbvlink2026-lab.github.io/wp-martodosko/wordpress/";

        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl(baseUrl + "index.html");
    }
}
