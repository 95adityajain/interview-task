/*
 * Represents Http Server Configuration object,
 * containing url-mappings that server accepts and other server configurations.
 */
package dippertask.httpserver;

import java.util.HashMap;

/**
 *
 * @author adityajain
 */
public class HttpServerConfig {
    
    public static final String CORE_THREAD_POOL_SIZE = "c_th_sz";
    public static final String MAX_THREAD_POOL_SIZE = "m_th_sz";
    public static final String KEEP_ALIVE_TIME = "k_al_tm";
    public static final String SERVER_PORT = "s_p";
    
    private final HashMap<String, String> urlMappings = getMappings();
    private final HashMap<String, Object> serverConfig = getConfigurations();
    
    private HashMap<String, String> getMappings() {
        HashMap<String, String> mappings = new HashMap<>();
        mappings.put("GET/api/request", "dippertask.httpserver.api.RequestUrlHandler");
        mappings.put("GET/api/serverStatus", "dippertask.httpserver.api.ServerStatusUrlHandler");
        mappings.put("PUT/api/kill", "dippertask.httpserver.api.KillUrlHandler");
        return mappings;
    }
    
    private HashMap<String, Object> getConfigurations() {
        HashMap<String, Object> config = new HashMap<>();
        config.put(MAX_THREAD_POOL_SIZE, 100);
        config.put(CORE_THREAD_POOL_SIZE, 50);
        config.put(KEEP_ALIVE_TIME, 10l);//10 in long.
        config.put(SERVER_PORT, 4567);
        return config;
    }
    
    public Object getConfig(String configName) {
        return (serverConfig.containsKey(configName)) ? serverConfig.get(configName) : null;
    }
    
    public boolean mappingExists(String url) {
        return urlMappings.containsKey(url);
    }
    
    public String getUrlHandlerClassName(String url) {
        return urlMappings.get(url);
    }
}
