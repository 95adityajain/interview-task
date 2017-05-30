/*
 * handles GET /api/serverStatus
 */
package dippertask.httpserver.api;

import dippertask.commons.Message;
import dippertask.commons.TTLServerCommand;
import dippertask.httpserver.HttpRequest;
import dippertask.httpserver.api.commons.Constants;
import dippertask.httpserver.util.HttpResponseGenerator;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.net.Socket;

/**
 *
 * @author adityajain
 */
public class ServerStatusUrlHandler implements UrlHandler{

    @Override
    public void handleRequest(HttpRequest request){
        try(Socket dataStoreCon = new Socket(Constants.TTLServer.HOST_NAME, Constants.TTLServer.PORT_NO)) {
            ObjectOutputStream out = new ObjectOutputStream(dataStoreCon.getOutputStream());
            ObjectInputStream in = new ObjectInputStream(dataStoreCon.getInputStream());
            
            Message message = new Message(TTLServerCommand.GETALL, null, null);
            out.writeObject(message);
            String response = (String)in.readObject();
            
            request.getOutputStream().write(HttpResponseGenerator.success(response));
        } catch(Exception e) {
            throw new RuntimeException("Error while handling request" + e);
        }
    }
}
