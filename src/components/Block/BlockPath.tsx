import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { traverseItemPath } from "esm-treero-api";
import log from "loglevel";
import { Fragment } from "react/jsx-runtime";
import { handleBlockOpen } from "../../api/api";
import yjs from "../../store/yjsManager";
import PlainMarkdown from "../Markdown/PlainMarkdown";

export default function BlockPath({ id }: { id: string }) {
  const yblocksArray = traverseItemPath(yjs.yblocks, id);

  log.debug("BlockPath", yblocksArray);

  return (
    <Breadcrumb className="BlockPath mb-5">
      <BreadcrumbList>
        {yblocksArray.map((item, idx) => {
          const itemId = item.get("id");
          const itemText = item.get("content").toString();
          const isLast = idx === yblocksArray.length - 1;

          return (
            <Fragment key={`BlockPathPart-${itemId || idx}`}>
              <BreadcrumbItem className="cursor-pointer">
                {isLast ? (
                  <BreadcrumbLink
                    className="max-w-30 truncate"
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleBlockOpen(itemId);
                    }}
                  >
                    <PlainMarkdown>{itemText}</PlainMarkdown>
                  </BreadcrumbLink>
                  // <BreadcrumbPage className="max-w-30 truncate">
                  //   <PlainMarkdown>{itemText}</PlainMarkdown>
                  // </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="max-w-30 truncate"
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleBlockOpen(itemId);
                    }}
                  >
                    <PlainMarkdown>{itemText}</PlainMarkdown>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
