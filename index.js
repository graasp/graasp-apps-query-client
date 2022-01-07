var httpStatusCodes = require('http-status-codes');
var reactQuery = require('react-query');
var devtools = require('react-query/devtools');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var STALE_TIME_MILLISECONDS = 0;
var CACHE_TIME_MILLISECONDS = 1000 * 60 * 5;

var REQUEST_METHODS;

(function (REQUEST_METHODS) {
  REQUEST_METHODS["GET"] = "GET";
  REQUEST_METHODS["POST"] = "POST";
  REQUEST_METHODS["DELETE"] = "DELETE";
  REQUEST_METHODS["PUT"] = "PUT";
  REQUEST_METHODS["PATCH"] = "PATCH";
})(REQUEST_METHODS || (REQUEST_METHODS = {}));

var DEFAULT_GET = {
  credentials: 'include',
  method: REQUEST_METHODS.GET,
  headers: {
    'Content-Type': 'application/json'
  }
};
var DEFAULT_REQUEST = {
  headers: {
    'content-type': 'application/json'
  },
  credentials: 'include'
};
var DEFAULT_GET_REQUEST = _extends({}, DEFAULT_REQUEST, {
  method: 'GET'
});
var DEFAULT_POST_REQUEST = _extends({}, DEFAULT_REQUEST, {
  method: 'POST'
});
var DEFAULT_PATCH_REQUEST = _extends({}, DEFAULT_REQUEST, {
  method: 'PATCH'
});
var DEFAULT_DELETE_REQUEST = _extends({}, DEFAULT_REQUEST, {
  method: 'DELETE'
});

var APP_DATA_ENDPOINT = 'app-data';
var APP_ITEMS_ENDPOINT = 'app-items';
var buildDownloadFileRoute = function buildDownloadFileRoute(id) {
  return APP_ITEMS_ENDPOINT + "/" + id + "/download";
};
var buildDeleteResourceRoute = function buildDeleteResourceRoute(itemId, id) {
  return APP_ITEMS_ENDPOINT + "/" + itemId + "/" + APP_DATA_ENDPOINT + "/" + id;
};
var buildUploadFilesRoute = function buildUploadFilesRoute(itemId) {
  return APP_ITEMS_ENDPOINT + "/upload?id=" + itemId;
};
var buildGetAppResourcesRoute = function buildGetAppResourcesRoute(itemId) {
  return APP_ITEMS_ENDPOINT + "/" + itemId + "/" + APP_DATA_ENDPOINT;
};
var buildGetUsersRoute = function buildGetUsersRoute(itemId) {
  return APP_ITEMS_ENDPOINT + "/" + itemId + "/context";
};
var API_ROUTES = {
  buildDownloadFileRoute: buildDownloadFileRoute,
  buildDeleteResourceRoute: buildDeleteResourceRoute,
  buildUploadFilesRoute: buildUploadFilesRoute,
  buildGetAppResourcesRoute: buildGetAppResourcesRoute,
  buildGetUsersRoute: buildGetUsersRoute
};

var useGetAppResources = function useGetAppResources(token, apiHost, itemId) {
  try {
    var url = apiHost + "/" + buildGetAppResourcesRoute(itemId);
    return Promise.resolve(fetch(url, _extends({}, DEFAULT_GET, {
      headers: _extends({}, DEFAULT_GET_REQUEST.headers, {
        Authorization: "Bearer " + token
      })
    }))).then(function (response) {
      return Promise.resolve(response.json());
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var RESOURCES_KEY = 'resources';

var configureAppsHooks = (function (queryConfig) {
  var retry = queryConfig.retry,
      cacheTime = queryConfig.cacheTime,
      staleTime = queryConfig.staleTime;
  var defaultOptions = {
    retry: retry,
    cacheTime: cacheTime,
    staleTime: staleTime
  };
  return {
    useAppResources: function useAppResources(token, apiHost, itemId) {
      var cache = reactQuery.useQueryClient();
      reactQuery.useQuery(_extends({
        queryKey: RESOURCES_KEY,
        queryFn: function queryFn() {
          return useGetAppResources(token, apiHost, itemId);
        }
      }, defaultOptions, {
        onSuccess: function onSuccess() {
          cache.invalidateQueries(RESOURCES_KEY);
        }
      }));
    }
  };
});

var configureHooks = (function (queryConfig) {
  return _extends({}, configureAppsHooks(queryConfig));
});

var retry = function retry(failureCount, error) {
  var codes = [httpStatusCodes.StatusCodes.UNAUTHORIZED, httpStatusCodes.StatusCodes.NOT_FOUND, httpStatusCodes.StatusCodes.BAD_REQUEST, httpStatusCodes.StatusCodes.FORBIDDEN];
  var reasons = codes.map(function (code) {
    return httpStatusCodes.getReasonPhrase(code);
  });

  if (reasons.includes(error.message) || reasons.includes(error.name)) {
    return false;
  }

  return failureCount < 3;
};

var queryClient = (function (config) {
  var baseConfig = {
    API_HOST: (config === null || config === void 0 ? void 0 : config.API_HOST) || process.env.REACT_APP_API_HOST || 'http://localhost:3000',
    S3_FILES_HOST: (config === null || config === void 0 ? void 0 : config.S3_FILES_HOST) || process.env.REACT_APP_S3_FILES_HOST || 'localhost',
    SHOW_NOTIFICATIONS: (config === null || config === void 0 ? void 0 : config.SHOW_NOTIFICATIONS) || process.env.REACT_APP_SHOW_NOTIFICATIONS === 'true' || false,
    keepPreviousData: (config === null || config === void 0 ? void 0 : config.keepPreviousData) || false
  };

  var queryConfig = _extends({}, baseConfig, {
    WS_HOST: (config === null || config === void 0 ? void 0 : config.WS_HOST) || process.env.REACT_APP_WS_HOST || baseConfig.API_HOST.replace('http', 'ws') + "/ws",
    enableWebsocket: (config === null || config === void 0 ? void 0 : config.enableWebsocket) || false,
    notifier: config === null || config === void 0 ? void 0 : config.notifier,
    staleTime: (config === null || config === void 0 ? void 0 : config.staleTime) || STALE_TIME_MILLISECONDS,
    cacheTime: (config === null || config === void 0 ? void 0 : config.cacheTime) || CACHE_TIME_MILLISECONDS,
    retry: retry
  });

  var queryClient = new reactQuery.QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: (config === null || config === void 0 ? void 0 : config.refetchOnWindowFocus) || false
      }
    }
  });
  var hooks = configureHooks(queryConfig);
  return {
    queryClient: queryClient,
    QueryClientProvider: reactQuery.QueryClientProvider,
    hooks: hooks,
    useMutation: reactQuery.useMutation,
    ReactQueryDevtools: devtools.ReactQueryDevtools,
    dehydrate: reactQuery.dehydrate,
    Hydrate: reactQuery.Hydrate
  };
});

exports.API_ROUTES = API_ROUTES;
exports.configureQueryClient = queryClient;
//# sourceMappingURL=index.js.map
