/*
 * Represents http request handlers
 */
package dippertask.httpserver.api;

import dippertask.httpserver.HttpRequest;
/**
 *
 * @author adityajain
 */
public interface UrlHandler {
    
    void handleRequest(HttpRequest request);
}
