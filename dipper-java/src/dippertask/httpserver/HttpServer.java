/*
 * Represents Socket server which accepts http request.
 */
package dippertask.httpserver;

import java.net.ServerSocket;
import java.io.IOException;
import java.net.Socket;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
/**
 *
 * @author adityajain
 */
public class HttpServer {

    private static final HttpServerConfig config;
    private static final HttpServerContext context;
    private static final ThreadPoolExecutor threadPool;
    
    static {
        config = new HttpServerConfig();
        context = new HttpServerContext();
        threadPool = new ThreadPoolExecutor(
                (int)config.getConfig(HttpServerConfig.CORE_THREAD_POOL_SIZE),
                (int)config.getConfig(HttpServerConfig.MAX_THREAD_POOL_SIZE),
                (long)config.getConfig(HttpServerConfig.KEEP_ALIVE_TIME),
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>()
        );
    }
    
    public static void main(String[] args) throws IOException {
        ServerSocket server = new ServerSocket((Integer)config.getConfig(HttpServerConfig.SERVER_PORT));
        System.out.println("Http Server started at port : " + config.getConfig(HttpServerConfig.SERVER_PORT));
        
        while(true){
            Socket socket = server.accept();
            threadPool.execute(new UrlHandlerTask(socket, context, config));
        }
    }
    
}
