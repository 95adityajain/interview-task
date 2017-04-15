/**
 * Implements a runnable thats is run for every http request.
 */
package dippertask.httpserver;

import java.net.Socket;
import java.io.IOException;
import dippertask.httpserver.api.UrlHandler;
import dippertask.httpserver.util.HttpResponseGenerator;
/**
 *
 * @author adityajain
 */
public class UrlHandlerTask implements Runnable{

    private final Socket clientSocket;
    private final HttpServerConfig serverConfig;
    private final HttpServerContext serverContext;
    
    public UrlHandlerTask(final Socket socket, final HttpServerContext context, final HttpServerConfig config){
        clientSocket = socket;
        serverConfig = config;
        serverContext = context;
    }
    
    @Override
    public void run() {
        try {
            HttpParser httpParser = new HttpParser(clientSocket.getInputStream());
            httpParser.parseRequest();
            //System.out.println(httpParser);
            
            String urlPattern = httpParser.getMethod() + httpParser.getRequestURL();
            if(false == serverConfig.mappingExists(urlPattern)) {
                clientSocket.getOutputStream().write(HttpResponseGenerator.notFound());
            } else {
                UrlHandler handler = (UrlHandler) Class.forName(serverConfig.getUrlHandlerClassName(urlPattern))
                        .getConstructor().newInstance();
                handler.handleRequest(new HttpRequest(httpParser, serverContext, clientSocket));
            }
        } catch(Exception e) {
            try {
                clientSocket.getOutputStream().write(HttpResponseGenerator.internalServerError());
            } catch(IOException ex) {
                throw new RuntimeException("Error while generating response " + ex);
            }
        } finally {
            try {
                clientSocket.close();
            } catch(IOException ex){
                throw new RuntimeException("Error while closing client socket " + ex);
            }
        }
    }
}
