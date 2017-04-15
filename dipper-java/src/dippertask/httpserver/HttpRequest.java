/**
 * Represents Http request object, to encapsulate data that needs to propagate further for responding to request
 */
package dippertask.httpserver;

import java.net.Socket;
import java.io.OutputStream;
import java.io.IOException;
/**
 *
 * @author adityajain
 */
public final class HttpRequest {
    
    private final HttpParser httpParser;
    private final HttpServerContext serverContext;
    private final Socket socket;
    
    public HttpRequest(final HttpParser parser, final HttpServerContext context,  final Socket soc){
        httpParser = parser;
        serverContext = context;
        socket = soc;
    }
    
    public String getRequestParam(String paramName) {
        return httpParser.getParam(paramName);
    }
    
    public String getRequestBody() {
        return httpParser.getBody();
    }
    
    public HttpServerContext getServerContext() {
        return serverContext;
    }
    
    public OutputStream getOutputStream() throws IOException {
        return socket.getOutputStream();
    }
}
